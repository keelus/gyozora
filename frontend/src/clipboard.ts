import { PasteFile, PasteFolder, ReadPath  } from "../wailsjs/go/main/App.js";
import { LoadFolder } from "./pathManager.js";
import { CURRENT_PATH, activeJobs, clipboardFiles, contents, currentJob, selectedFiles } from "./store"
import { get } from "svelte/store"
import { GenerateToast } from "./toasts.js";
import toast from "svelte-french-toast";
import { models } from "../wailsjs/go/models.js";
export function CopyToClipboard() {
	clipboardFiles.set(get(selectedFiles))
}

import { AddJob, type ActiveJob, UpdateJob, RemoveJob, JobType } from "./activeJobsLogin.js";
import OpenModal from "./modals/manager.js";
import { Plural } from "./utils.js";


export async function PasteFromClipboard() {
	let failedPastes : models.SysFile[] = []
	const targetPath = get(CURRENT_PATH);
	let donePastes = 0
	let todoPastes = get(clipboardFiles).length;
	const JOB_ID = AddJob("Pasting files", -1, "Discovering folders...", JobType.PASTE)

	async function getTree(files : models.SysFile[]) : Promise<models.SysFile[]> {
		console.warn("🌳 tree generation start.")
		let baseFiles = files
		for(let i = 0; i < baseFiles.length; i++) {
			if(!baseFiles[i].isFolder) continue;
	
			let childrens = await getChildrens(files[i])
	
			files[i].childrenFiles = childrens.dirFiles;
			files[i].childrenFolders = childrens.dirFolders;
	
		}
	
		console.warn("🌳 tree generation end.")
		return files;
	}
	
	async function getChildrens(folder : models.SysFile) : Promise<models.ReadPathResponse> {
		let baseChildrens = await ReadPath(targetPath, folder.pathfull)
		let hasFolders = baseChildrens.dirFolders.length > 0
	
		if(hasFolders) {
			for(let i = 0; i < baseChildrens.dirFolders.length; i++){
				let childrens = await getChildrens(baseChildrens.dirFolders[i])
				baseChildrens.dirFolders[i].childrenFiles = childrens.dirFiles
				baseChildrens.dirFolders[i].childrenFolders = childrens.dirFolders
			}
		}
		todoPastes++;
		todoPastes+=baseChildrens.dirFiles.length
	
		return baseChildrens;
	}

	async function copyFiles(files : models.SysFile[], isBase : boolean) : Promise<any> {
		for(let file of files) {
			const response = await PasteFile(file, targetPath, isBase);
			if(response.error.status) {
				failedPastes.push(file)
				console.error(response.error.reason)
			} else {
				if(get(CURRENT_PATH) == response.file.path) {
					contents.update(cts => {
						cts.push(response.file)
						return cts;
					})
				}
			}
			donePastes++;
		}
	}

	async function copyFolder(folder : models.SysFile, isBase : boolean) : Promise<any> {
		let failed = false;
		
		let sendingFolder = { ...folder};
		sendingFolder.childrenFiles = []
		sendingFolder.childrenFolders = []
		const response = await PasteFolder(sendingFolder, targetPath, isBase);
		if(response.error.status) {
			failedPastes.push(folder)
			console.error(response.error.reason)
			failed = true;
		} else {
			if(get(CURRENT_PATH) == response.file.path) {
				contents.update(cts => {
					cts.push(response.file)
					return cts;
				})
			}
			// console.log("Update visual content if in current path.")
			// console.warn("Pasted '" + folder.pathfull + "'.")
		}
		donePastes++;
		return failed;
	}

	async function processNode(folder : models.SysFile) : Promise<any> {
		// console.warn("📍 node processing start")
		let folderPromises = []

		const responseThisFolder = await copyFolder(folder, false)
		
		if(responseThisFolder == true) {
			console.warn("A folder creation failed. Cancelling this one.")
			return;
		}

		if(folder.childrenFiles.length > 0)
			folderPromises.push(copyFiles(folder.childrenFiles, false))

		await Promise.all(folderPromises)

		let subpromises = []

		if(folder.childrenFolders.length > 0)
			for(let subfolder of folder.childrenFolders) {
				const subpromise = processNode(subfolder)
				subpromises.push(subpromise)
			}

		await Promise.all(subpromises)
		// console.warn("📍 node processing end")
	}

	async function processTree(tree : models.SysFile[]) {
		return new Promise(async (resolve, reject) => {
			// console.warn("🌳 tree processing start")
			let baseFolders = tree.filter(file => file.isFolder)
			let baseFiles = tree.filter(file => !file.isFolder)
		
			let basePromises = []
	
			if(baseFolders.length > 0)
				for(let baseFolder of baseFolders) {
					basePromises.push(processNode(baseFolder))
				}
	
			if(baseFiles.length > 0)
				basePromises.push(copyFiles(baseFiles, true))
	
			await Promise.all(basePromises)
			// console.warn("🌳 tree processing end")
			if(failedPastes.length == 0)
				return resolve(true)
			else reject(true)
		})
	}


	(async function main() {
		if(!PastableFromClipboard()) return;
		console.log("Pasting from clibpoard!")


		const pastingFiles = get(clipboardFiles)

		const beginning = new Date()
		let fileTree : models.SysFile[] = [];
		fileTree = await getTree(pastingFiles); // TODO: Check first if base folders exists, instead of also treeing them.

		fileTree.sort((a, b) => {
			if(a.isFolder && b.isFolder) { // TODO: Get real folder file sizes
				let aLength = ((a.childrenFiles?.length ?? 0) + (a.childrenFolders?.length ?? 0))
				let bLength = ((b.childrenFiles?.length ?? 0) + (b.childrenFolders?.length ?? 0))
				return aLength - bLength

			} else if (a.isFolder && !b.isFolder) {
				return 1

			} else if (!a.isFolder && b.isFolder) {
				return -1
				
			} else {
				return a.size - b.size
			}
		})

		

		function updateJobVisual() {
			console.log("Done pastes:", donePastes)
			UpdateJob(JOB_ID, "Pasting. " + failedPastes.length + Plural(failedPastes.length, " file") + " failed.", (donePastes * 100 / todoPastes))
		}
		updateJobVisual()
		let progressInterval = setInterval(updateJobVisual, 1000)

		await toast.promise(
			processTree(fileTree),
			{
				loading:"Pasting files 📋",
				success:"All Copied.",
				error:"Some files could not be pasted.",
			},
			{
				position:'bottom-left'
			}
		).catch(error => {})
		clearInterval(progressInterval)
		RemoveJob(JOB_ID)
		const end = new Date()

		const diffSeconds = Math.floor((end - beginning) / 1000);
		console.log("Difference in seconds: ", diffSeconds)
		console.log("Difference in minutes and seconds: ", Math.floor(diffSeconds / 60) + ":" + diffSeconds % 60)
		
		if(failedPastes.length > 0) {
			OpenModal("pasteErrorLog", failedPastes)
		}

		console.log("PASTE ENDED")
		LoadFolder(targetPath, false, false, true) // TODO: Remove this
	})()

	return;

	await toast.promise(
		PastePerLayer(pastingFiles, targetLocation),
		{
			loading:"Pasting...",
			success:"Pasted all!",
			error:"Some not pasted!"
		},
		{
			position:'bottom-left'
		}
	).catch(error => {})

	// console.log("Hello!")

	// if(get(CURRENT_PATH) == targetLocation) { // If we are in a different folder, no need to reload current. Else, yes
	// 	LoadFolder(targetLocation, false, false, true)
	// }

}


export function PastableFromClipboard() {
	return get(clipboardFiles).length > 0
}

export async function PastePerLayer (pastingFiles : models.SysFile[], targetPath : string) {
	return new Promise(async(resolve, reject) => {
		let errors = false;

		//In the first call, one or multiple files could be selected. 

		// Algorythm to get the contents of a path (& subpath) by layers, to copy and paste
		// TODO: Forget about layers, and instead copy-paste layer 0 completly. When finished, analyze layer 1 and then copy-paste it, etc
		let hasFolders = false
		let curCall : models.ReadPathResponse;
		let currentLayer : models.SysFile[] = []
		let layerIndex = 0
		for(let file of pastingFiles) {
			if(file.isFolder) hasFolders = true
			currentLayer.push(file)
		}

		let failedPastes = []
		
		// Copy paste current layer. Then keep going
		failedPastes = await layerPaste(currentLayer, targetPath, layerIndex)
		

		while(hasFolders) {
			layerIndex++;
			let newLayer : models.SysFile[] = []
			hasFolders = false
			for(let elem of currentLayer){
				if(!elem.isFolder) continue;
				
				curCall = await ReadPath(targetPath, elem.pathfull, layerIndex)

				let curSemiLayer = curCall.dirFiles.concat(curCall.dirFolders);
				curSemiLayer.forEach(elem => newLayer.push(elem))

				if(curCall.dirFolders.length > 0) hasFolders = true
			}

			currentLayer = newLayer

			// Copy paste current layer. Then keep going
			failedPastes = failedPastes.concat(await layerPaste(currentLayer, targetPath, layerIndex))
		}
		console.log("Algorythim ended")

		if(errors) {
			reject("Error pasting some files.")
		} else {
			resolve("All files pasted successfully.")
		}
	})

	
}

async function layerPaste(layerElements : models.SysFile[], targetPath : string, layerIndex : number) : Promise<models.SysFile[]> {
	let failedPastes : models.SysFile[] = []

	for(let elem of layerElements) {
		const response = await PasteFile(elem, targetPath, layerIndex)
		// Here we get the new pasted/created file path and fullpath
		// let pastedPath = ...
		if(response.error.status) {
			console.error(response.error.reason)
			failedPastes.push(elem)
		}else {
			if(get(CURRENT_PATH) == response.file.path){ // If user is currently on the pasting path (of the newly file created)

				contents.update(cts => {
					cts.push(response.file)
					return cts
				})
			}
		}
	}

	return failedPastes
}