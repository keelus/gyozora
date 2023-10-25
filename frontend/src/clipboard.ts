import { PasteFile, ReadPath } from "../wailsjs/go/main/App.js";
import { LoadFolder } from "./pathManager.js";
import { CURRENT_PATH, clipboardFiles, contents, currentJob, selectedFiles } from "./store"
import { get } from "svelte/store"
import { GenerateToast } from "./toasts.js";
import toast from "svelte-french-toast";
import { models } from "../wailsjs/go/models.js";

export function CopyToClipboard() {
	clipboardFiles.set(get(selectedFiles))
}

export async function PasteFromClipboard() {
	if(!PastableFromClipboard) return;
	const targetLocation = get(CURRENT_PATH);
	const pastingFiles = get(clipboardFiles)

	await toast.promise(
		PastePerLayer(pastingFiles, targetLocation),
		{
			loading:"Pasting...",
			success:"Pasted all!",
			error:"Some not pasted!"
		},
		{
			position:'bottom-right'
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
		console.log(currentLayer)
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
			console.log(currentLayer)
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
	console.warn("BEGIN LAYER")
	let failedPastes : models.SysFile[] = []

	for(let elem of layerElements) {
		const response = await PasteFile(elem, targetPath, layerIndex)
		// Here we get the new pasted/created file path and fullpath
		// let pastedPath = ...
		if(response.error.status) {
			console.error(response.error.reason)
			failedPastes.push(elem)
		}else {
			console.log("Pasted '" + elem.pathfull + "'")
			if(get(CURRENT_PATH) == response.file.path){ // If user is currently on the pasting path (of the newly file created)

				console.log(contents)
				console.log(elem)
				contents.update(cts => {
					cts.push(response.file)
					return cts
				})
				console.log(contents)
			}
		}
	}

	console.warn("END LAYER")
	return failedPastes
}