import { PasteFile, ReadPath } from "../wailsjs/go/main/App.js";
import { LoadFolder } from "./pathManager.js";
import { CURRENT_PATH, clipboardFiles, currentJob, selectedFiles } from "./store"
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
		paste(pastingFiles, targetLocation),
		{
			loading:"Pasting...",
			success:"Pasted all!",
			error:"Some not pasted!"
		},
		{
			position:'bottom-right'
		}
	).catch(error => {})

	console.log("Hello!")

	if(get(CURRENT_PATH) == targetLocation) { // If we are in a different folder, no need to reload current. Else, yes
		LoadFolder(targetLocation, false, false, true)
	}

}

async function paste(pastingFiles : models.SysFile[], targetLocation : string) { // TODO: Do the tree copy on folder with javascript, so the user can know the progress
	return new Promise(async(resolve, reject) => {
		let errors = false;
		for(let file of pastingFiles) {
			const completed = await PasteFile(file, targetLocation)
			if(!completed){
				console.error("Error pasting '" + file.filename + "'")
				errors = true
			}
		}

		if(errors) {
			reject("Error pasting some files.")
		} else {
			resolve("All files pasted successfully.")
		}
	})
}

export function PastableFromClipboard() {
	return get(clipboardFiles).length > 0
}