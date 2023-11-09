import { ReadPath, RenderPreview, OpenFile } from '../wailsjs/go/main/App.js';
import type { models } from "wailsjs/go/models";
import { USER_OS, contents, selectedFiles } from "./store"
import { get } from "svelte/store";
import { CURRENT_PATH, CURRENT_PATH_BREADCRUMB_ELEMENTS, backHistory, forwardHistory, goBackEnabled, goForwardEnabled, previewProgress, currentJob } from "./store";
import { doAction } from './contextMenu.js';
import { GenerateToast } from './toasts.js';
import { GetSetting } from './settings.js';
import { GetWord } from './languages.js';
import { AddJob, JobType, RemoveJob, UpdateJob } from './activeJobsLogin.js';

export async function LoadFolder(newPath : string, goingBack : boolean, goingForward : boolean, ignorePathHistory : boolean) {
	console.log("Loading folder 📂 ...")
	// Check if we are able to open directory

	newPath = newPath.replace(/[\/\\]+$/, '')
	if(/^[A-Za-z]:$/.test(newPath)) {
		newPath += "\\";
	}

	const readPathResponse : models.ReadPathResponse = await ReadPath(newPath, newPath)

	if(readPathResponse.error.status) {
		GenerateToast("error", GetWord("readPathError") + readPathResponse.error.reason || "", "📂")
		return console.log("Error reading path!", readPathResponse.error.reason)
	}

	contents.set([])
	selectedFiles.set([])



	const dirFiles = readPathResponse.dirFiles.sort((f1, f2) => f1.filename.localeCompare(f2.filename));
	const dirFolders = readPathResponse.dirFolders.sort((f1, f2) => f1.filename.localeCompare(f2.filename));
	const breadcrumbs = readPathResponse.breadcrumbs.reverse()

	const directoryElements = dirFolders.concat(dirFiles) // Sort by filename ascending. Add .reversed() if sorted by name descending
	

	// if(error != null) ...
	
	if(!ignorePathHistory) {
		if(goingBack && !goingForward) {
			forwardHistory.update(fHistory => {
				fHistory.push(get(CURRENT_PATH))
				return fHistory
			})
		} else if (!goingBack && goingForward) {
			backHistory.update(bHistory => {
				bHistory.push(get(CURRENT_PATH))
				return bHistory
			})
		} else if (!goingBack && !goingForward) {
			backHistory.update(bHistory => {
				bHistory.push(get(CURRENT_PATH))
				return bHistory
			})
			forwardHistory.set([])
		}
	}

	goBackEnabled.set(get(backHistory).length > 0);
	goForwardEnabled.set(get(forwardHistory).length > 0);

	CURRENT_PATH.set(newPath)

	const newElements = directoryElements.map((element) => ({
		...element,
	}))
	contents.set(newElements)
	// Load breadcrumb:

	CURRENT_PATH_BREADCRUMB_ELEMENTS.set(breadcrumbs)

	console.log(breadcrumbs)
	console.log(CURRENT_PATH_BREADCRUMB_ELEMENTS)


	let previewTotalCount = directoryElements.filter(element => element.iconClass == "fileImage").length

	// let batchUnix = Math.floor(Date.now() / 1000)
	let batchUnix = Math.floor(Math.random() * 999_999_999)
	currentJob.set(batchUnix)

	previewProgress.set("0")

	const useThumbnails = GetSetting("useThumbnails") === "true"
	const useCache = GetSetting("useCache") === "true"

	let frontJobID = "-1";
	if (previewTotalCount == 0 || !useThumbnails) {
		console.log("NO PREVIEW NEEDED")
	} else {
		let remaining = previewTotalCount
		frontJobID = AddJob(GetWord("jobRenderTitle"), 0, GetWord("jobRenderDesc"), JobType.RENDER);
		console.log("Current job: ", get(currentJob))

		for(let i = 0; i < directoryElements.length; i++ ){
			if(get(currentJob) != batchUnix) {
				console.log("COMPLETLY CANCELLED 0")
				break
			}

			if(directoryElements[i].iconClass != "fileImage") continue;
			// console.log("Calling to render: '" + directoryElements[i].name + "'")
			remaining -= 1 

			let newPreview =  await RenderPreview(directoryElements[i],  batchUnix, remaining, useCache);
			const progress = (previewTotalCount - remaining) * 100 / previewTotalCount
			previewProgress.set(progress.toFixed(2))

			if(get(currentJob) != batchUnix) {
				console.log("COMPLETLY CANCELLED !")
				break
			}

			contents.update(cts => {
				if(cts[i] === undefined) return cts
				cts[i].preview = newPreview.preview
				return cts
			})
			UpdateJob(frontJobID, GetWord("jobRenderDesc"), progress)
		}
	}
	
	if(get(currentJob) == batchUnix) {
		console.log("Preview render finished")
		currentJob.set(-1)
	}
	RemoveJob(frontJobID)
	previewProgress.set("100")
}
export async function elementClicked(fpath : string, isfolder : boolean) {
	if(isfolder){
		return LoadFolder(fpath, false, false, false)
	}

	const actionResponseOpen : models.ActionResponse = await OpenFile(fpath)
	if(actionResponseOpen.error.status) {
		GenerateToast("error", GetWord("actionRenameToasFailed") + actionResponseOpen.error.reason || "", "🚀")
	} else {
		GenerateToast("success", GetWord("actionOpenToastSuccess"), "🚀")
	}
}

export function buttonGoBack() {
	if(get(backHistory).length == 0) return console.log("✋ Can't go back")
	console.log("👈 going back")

	let newPath : string = "";
	backHistory.update(bHistory => {
		if(bHistory.length > 0) newPath = bHistory.pop() || "";
		return bHistory
	})

	return LoadFolder(newPath, true, false, false)
}

export function buttonGoForward() {
	if(get(forwardHistory).length == 0) return console.log("✋ Can't go forward")
	console.log("going forward 👉")
	
	let newPath : string = "";
	forwardHistory.update(fHistory => {
		if(fHistory.length > 0) newPath = fHistory.pop() || "";
		return fHistory
	})

	return LoadFolder(newPath, false, true, false)
}


export function addToSelected(ev : MouseEvent, file : models.SysFile) {
	if(ev.button != 0 && ev.button != 2) return;

	if(ev.button == 2 || (get(USER_OS) == "darwin" && ev.button == 0 && ev.ctrlKey)) { // RIGHT CLICK
		if(get(selectedFiles).includes(file)) return; // If right clicked multiple, do nothing
		let newSelectedFiles = [file] // if right clicked one that is not selected, then we select this
		selectedFiles.set(newSelectedFiles)
		return
	}

	if(ev.ctrlKey && !ev.shiftKey || (get(USER_OS) == "darwin" && ev.button == 0 && ev.metaKey)) { // CTRL LEFT CLICK
		let newSelectedFiles = []
		if(get(selectedFiles).includes(file)){
			for(let i = 0; i < get(selectedFiles).length; i++) {
				if(get(selectedFiles)[i] != file)
				newSelectedFiles.push(get(selectedFiles)[i])
			}
		}
		else {
			newSelectedFiles = get(selectedFiles)
			newSelectedFiles.push(file)
		}
		selectedFiles.set(newSelectedFiles)
		return
	}

	if (ev.shiftKey) {
		if(get(selectedFiles).length == 0){ // No item has been selected previously 
			let newSelectedFiles = []
			for(let i = 0; i < get(contents).length; i++) {
				newSelectedFiles.push(get(contents)[i])
				if(get(contents)[i] == file) // Select from file 0 to selected with mayus
					break;
			}
			selectedFiles.set(newSelectedFiles)
			return
		} else { 
			// Else if one or more files has been selected, we will select from the last one to the current selected
			let firstSelectedIndex = get(contents).indexOf(get(selectedFiles)[0])
			let lastSelectedIndex = get(contents).indexOf(get(selectedFiles)[get(selectedFiles).length-1])
			let selectedIndex = get(contents).indexOf(file)

			// Check if the newly selected is the same as the last selected. If is, then do nothing.
			if(selectedIndex == lastSelectedIndex) return;

			// If is not, check if the newly selected is before the first selected element, if is, then select from this one to that.
			if(selectedIndex < firstSelectedIndex) {
				let newSelectedFiles = []
				for(let i = selectedIndex; i <= firstSelectedIndex; i++) {
					newSelectedFiles.push(get(contents)[i])
				}
				selectedFiles.set(newSelectedFiles)
				return
			}

			// If is not, check if is one of the currently selected ones. If is, then we select from the first originally selected
			// to this one, removing the rest.
			if(get(selectedFiles).includes(file)) {
				let newSelectedFiles = []
				for(let i = firstSelectedIndex; i <= selectedIndex; i++) {
					newSelectedFiles.push(get(contents)[i])
				}
				selectedFiles.set(newSelectedFiles)
				return
			}
			
			// If is not, then we select from the last of selected to this file.
			let newSelectedFiles = get(selectedFiles)
			for(let i = lastSelectedIndex + 1; i <= selectedIndex; i++) {
				newSelectedFiles.push(get(contents)[i])
			}
			selectedFiles.set(newSelectedFiles)
			return
		}
	}

	selectedFiles.set([file])
}