import { get } from "svelte/store";
import { selectedFiles, fileContextMenuOptions, CURRENT_PATH, contents } from "./store";
import { OpenFile, AddFile, RenameFile, DeleteFile, } from '../wailsjs/go/main/App.js'
import OpenModal from "./modals/manager";
import type { models } from 'wailsjs/go/models.js';
import toast from "svelte-french-toast";
import { GenerateToast } from "./toasts";
import { LoadFolder } from "./pathManager";
import { CopyToClipboard, PastableFromClipboard, PasteFromClipboard } from "./clipboard";
import { Plural } from "./utils";
import { AddJob, JobType, RemoveJob, UpdateJob } from "./activeJobsLogin";
import { GetSetting } from "./settings";
import { GetWord } from "./languages";

export async function openFileContextMenu(fileContextMenu : HTMLDivElement, coordinates : {[key:string]:number}, file : Element | null) {
	fileContextMenu.classList.add("opened")
	console.log(get(selectedFiles))

	if(file == null) { // Right clicked in the body
		await setContextMenuOptions("none")
		selectedFiles.set([])
	} else {
		if(get(selectedFiles).length <= 1){
			await setContextMenuOptions("single")
		} else {
			await setContextMenuOptions("multiple")
		}
	}
	
	const minMarginX = 20;
	const minMarginY = 40;

	let windowW = window.innerWidth;
	let windowH = window.innerHeight;

	let dX = coordinates.x || 0;
	let dY = coordinates.y || 0;

	let offX = dX + fileContextMenu.clientWidth + minMarginX - windowW;
	let offY = dY + fileContextMenu.clientHeight + minMarginY - windowH;

	let finalX = offX > 0 ? windowW - fileContextMenu.clientWidth - minMarginX : dX;
	let finalY = offY > 0 ? windowH - fileContextMenu.clientHeight - minMarginY : dY;

	fileContextMenu.style.left = `${finalX}px`
	fileContextMenu.style.top = `${finalY}px`

}

export function closeFileContextMenu(fileContextMenu : HTMLDivElement) {
	fileContextMenu.classList.remove("opened")
}


export async function setContextMenuOptions(mode : string) {
	fileContextMenuOptions.set({	
		add:{show:true,disabled:false},
		open:{show:true,disabled:false},
		cut:{show:true,disabled:false},
		copy:{show:true,disabled:false},
		paste:{show:true,disabled:false},
		rename:{show:true,disabled:false},
		delete:{show:true,disabled:false},
		properties:{show:true,disabled:false}
	})

	if(mode == "") return;
	const clipboardPastable = PastableFromClipboard()

	if(mode == "none") {
		fileContextMenuOptions.update(options => {
		  return {
			...options,
			open: { show: false, disabled: false },
			cut: { show: false, disabled: false },
			copy: { show: false, disabled: false },
			paste: { show: true, disabled: !clipboardPastable },  // Check clipboard
			rename: { show: false, disabled: false },
			delete: { show: false, disabled: false }
		  };
		});
	}

	if(mode == "single") {
		fileContextMenuOptions.update(options => {
		  return {
			...options,
			add: { show: false, disabled: false },
			paste: { show: true, disabled: !clipboardPastable }  // Check clipboard
		  };
		});
	}

	if(mode == "multiple") {
		fileContextMenuOptions.update(options => {
		  return {
			...options,
			add: { show: false, disabled: false },
			open: { show: false, disabled: false },
			paste: { show: true, disabled: !clipboardPastable },  // Check clipboard
			rename: { show: false, disabled: false },
			properties: { show: false, disabled: false }
		  };
		});
	}
	
}



export async function doAction(action : string) {
	const selFiles = get(selectedFiles)
	console.log(selFiles)
	console.log("🔥 Doing the action: ", action)
	switch(action) {
		case "open":
			const selFile = get(selectedFiles)[0]
			if(selFile === undefined) return
			if(selFile.isFolder)
				return LoadFolder(selFile.pathfull, false, false, false)

			const actionResponseOpen : models.ActionResponse = await OpenFile(selFile.pathfull)
			if(actionResponseOpen.error.status) {
				GenerateToast("error", GetWord("actionOpenToasFailed") + actionResponseOpen.error.reason || "", "🚀")
			} else {
				GenerateToast("success", GetWord("actionOpenToastSuccess"), "🚀")
			}
			break;
		case "add":
			const modalResponse = await OpenModal({modalName:"newFile"})
			if(modalResponse?.cancelled) return;

			// Dialog...
			const actionResponse : models.ActionResponse = await AddFile(get(CURRENT_PATH), modalResponse?.content[0], modalResponse?.content[1])
			if(actionResponse.error.status) {
				console.error("File creation err:", actionResponse.error.reason || "Unknown")
				GenerateToast("error", GetWord("actionAddToasFailed") + actionResponse.error.reason || "", "📄")
			} else {
				contents.update(cts => {
					cts.push(actionResponse.file)
					return cts
				})
				GenerateToast("success", GetWord("actionAddToastSuccess"), "📄")
			}
			break;
		case "cut":
			break;
		case "copy":
			CopyToClipboard()
			break;
		case "paste":
			PasteFromClipboard()
			break;
		case "rename":
			const modalResponseRename = await OpenModal({modalName:"rename", file:get(selectedFiles)[0]})
			if(modalResponseRename?.cancelled) return

			// Dialog...
			const targetFile = get(selectedFiles)[0];
			const newFilename = modalResponseRename?.content[0]
			const actionResponseRename : models.ActionResponse = await RenameFile(targetFile, newFilename)
			if(actionResponseRename.error.status) {
				console.error("File rename err:", actionResponseRename.error.reason || "Unknown")
				GenerateToast("error", GetWord("actionRenameToasFailed") + actionResponseRename.error.reason || "", "✏️")
			} else {
				contents.update(cts => {
					for(let i = 0; i < cts.length; i++) {
						if(cts[i].pathfull == targetFile.pathfull)
							cts[i] = actionResponseRename.file
					}
					return cts
				})
				GenerateToast("success", GetWord("actionRenameToastSuccess")+" \"" + newFilename + "\".", "✏️")
			}
			break;
		case "delete":
			if(GetSetting("showDeleteConfirmation") === "true") {
				const modalResponseDelete = await OpenModal({modalName:"delete"})
				if(modalResponseDelete?.cancelled) return;
			}
			
			const deletingFiles = get(selectedFiles)
			let failedDeletes : models.SysFile[] = []
			let doneDeletes = 0
			let todoDeletes = deletingFiles.length

			const JOB_ID = AddJob(GetWord("jobDeleteTitle"), -1, "", JobType.DELETE)

			let progressInterval : number;
			if(todoDeletes > 1){
				function updateJobVisual() {
					UpdateJob(JOB_ID, GetWord("jobDeleteDesc1") + failedDeletes.length + Plural(failedDeletes.length, GetWord("jobDeleteDesc1File")) + (failedDeletes.length == 1 ? GetWord("jobDeleteDesc1FailedSingular") : GetWord("jobDeleteDesc1FailedPlural")), (doneDeletes * 100 / todoDeletes))
				}
				updateJobVisual()
				progressInterval = setInterval(updateJobVisual, 1000)
			}

			await toast.promise(
				new Promise(async (resolve, reject) => {
					for(let file of deletingFiles) {
						let fileDeleteErr = await DeleteFile(file)
						if(fileDeleteErr.status){
							failedDeletes.push(file)
							continue
						}

						doneDeletes++;
						if(get(CURRENT_PATH) === file.path) {
							contents.update(cts => {
								let newCts : models.SysFile[] = []
								for(let i = 0; i < cts.length; i++){
									if(cts[i] !== file)
										newCts.push(cts[i])
								}
								return newCts
							})
						}
						
						selectedFiles.update(selFiles => {
							let newSelFiles : models.SysFile[] = []
							for(let i = 0; i < selFiles.length; i++){
								if(selFiles[i] !== file)
									newSelFiles.push(selFiles[i])
							}
							return newSelFiles
						})

					}
			

					if(todoDeletes>1) clearInterval(progressInterval)
					RemoveJob(JOB_ID)
					if(failedDeletes.length > 0) {
						OpenModal({modalName:"deleteErrorLog", files:failedDeletes})
						reject(true)
					} else {
						selectedFiles.set([])
					}
					resolve(true)
				}),
				{
					loading: GetWord("jobDeleteTitle")+" 🗑️",
					success: GetWord("jobDeleteToastSuccess"),
					error: GetWord("jobDeleteToastError"),
				},
				{
					position:'bottom-left'
				}
			).catch(error => {})
			
			break;
		case "properties":
			const modalResponseProperties = await OpenModal({modalName:"properties", file:get(selectedFiles)[0]})
			if(modalResponseProperties?.cancelled) return;
			break;
		default:
			console.log("📛 unknown action")
			break;
	}
}