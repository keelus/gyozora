import { get } from "svelte/store";
import { selectedFiles, fileContextMenuOptions, CURRENT_PATH, contents } from "./store";
import { OpenFile, AddFile, CutFile_s, CopyFile_s, RenameFile, DeleteFile_s, PropertiesFile } from '../wailsjs/go/main/App.js'
import OpenModal from "./modals/manager";
import type { models } from 'wailsjs/go/models.js';
import toast from "svelte-french-toast";
import { GenerateToast } from "./toasts";
import { LoadFolder } from "./pathManager";
import { CopyToClipboard, PastableFromClipboard, PasteFromClipboard } from "./clipboard";
import { Plural } from "./utils";
import { AddJob, JobType, RemoveJob, UpdateJob } from "./activeJobsLogin";

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
				return LoadFolder(selFile.pathfull, false, false, false) // TODO: Error handling

			const actionResponseOpen : models.ActionResponse = await OpenFile(selFiles[0].pathfull)
			if(actionResponseOpen.error.status) {
				GenerateToast("error", "Can't open the file: " + actionResponseOpen.error.reason || "", "🚀")
			} else {
				GenerateToast("success", "File opened.", "🚀")
			}
			break;
		case "add":
			const modalResponse = await OpenModal("newFile")
			if(modalResponse?.cancelled) return;

			// Dialog...
			const actionResponse : models.ActionResponse = await AddFile(get(CURRENT_PATH), modalResponse?.content[0], modalResponse?.content[1])
			if(actionResponse.error.status) {
				console.error("File creation err:", actionResponse.error.reason || "Unknown")
				GenerateToast("error", "Error creating the new file. " + actionResponse.error.reason || "", "📄")
			} else {
				contents.update(cts => {
					cts.push(actionResponse.file)
					return cts
				})
				GenerateToast("success", "File created.", "📄")
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
			const modalResponseRename = await OpenModal("rename")
			if(modalResponseRename?.cancelled) return

			// Dialog...
			const targetFile = get(selectedFiles)[0];
			const newFilename = modalResponseRename?.content[0]
			const actionResponseRename : models.ActionResponse = await RenameFile(targetFile, newFilename)
			if(actionResponseRename.error.status) {
				console.error("File rename err:", actionResponseRename.error.reason || "Unknown")
				GenerateToast("error", "Error renaming the file. " + actionResponseRename.error.reason || "", "✏️")
			} else {
				contents.update(cts => {
					for(let i = 0; i < cts.length; i++) {
						if(cts[i].pathfull == targetFile.pathfull)
							cts[i] = actionResponseRename.file
					}
					return cts
				})
				GenerateToast("success", "File renamed to \"" + newFilename + "\".", "✏️")
			}
			break;
		case "delete":
			const modalResponseDelete = await OpenModal("delete")
			if(modalResponseDelete?.cancelled) return;
			
			const selFiles = get(selectedFiles)

			const JOB_ID = AddJob("Deleting files", -1, "", JobType.DELETE)

			// TODO: Delete files one by one
			let actionResponseDel : models.ActionResponse;
			await toast.promise(
				new Promise(async (resolve, reject) => {
					actionResponseDel = await DeleteFile_s(selFiles)

					if(actionResponseDel.error.status) {
						console.error("File deleting err:", actionResponseDel.error.reason || "Unknown")
						RemoveJob(JOB_ID)
						reject(true)
					} else {
						contents.update(cts => {
							let newCts : models.SysFile[] = []
							for(let i = 0; i < cts.length; i++){
								if(!get(selectedFiles).includes(cts[i]))
									newCts.push(cts[i])
							}
							return newCts
						})
						selectedFiles.set([])
						RemoveJob(JOB_ID)
					}
					resolve(true)
				}),
				{
					loading:"Deleting files 🗑️",
					success:"Files deleted.",
					error:"Some files could not be deleted.",
				},
				{
					position:'bottom-left'
				}
			).catch(error => {})
			// TODO: show what file sdidnt delete
			
			break;
		case "properties":
			const modalResponseProperties = await OpenModal("properties")
			if(modalResponseProperties?.cancelled) return;
			break;
		default:
			console.log("📛 unknown action")
			break;
	}
}