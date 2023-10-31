import { PasteFile, PasteFolder, ReadPath, FileExists } from "../wailsjs/go/main/App.js";
import { CURRENT_PATH, clipboardFiles, contents, selectedFiles } from "./store"
import { get } from "svelte/store"
import toast from "svelte-french-toast";
import { models } from "../wailsjs/go/models.js";
export function CopyToClipboard() {
	clipboardFiles.set(get(selectedFiles))
}

import { AddJob, UpdateJob, RemoveJob, JobType } from "./activeJobsLogin.js";
import OpenModal from "./modals/manager.js";
import { Plural } from "./utils.js";
import { GetWord } from "./languages.js";


export async function PasteFromClipboard() {
	let failedPastes : models.SysFile[] = []
	const targetPath = get(CURRENT_PATH);
	let donePastes = 0
	let todoPastes = get(clipboardFiles).length;
	const JOB_ID = AddJob(GetWord("jobPasteTitle"), -1, GetWord("jobPasteDesc"), JobType.PASTE)

	async function getTree(files : models.SysFile[]) : Promise<models.SysFile[]> {
		let baseFiles = files
		for(let i = 0; i < baseFiles.length; i++) {
			if(!baseFiles[i].isFolder) continue;

			let folderExists = await FileExists(targetPath, baseFiles[i].filename)
			if(folderExists) {
				failedPastes.push(baseFiles[i])
				continue
			}
	
			let childrens = await getChildrens(files[i])
	
			files[i].childrenFiles = childrens.dirFiles;
			files[i].childrenFolders = childrens.dirFolders;
		}
	
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
			let baseFolders = tree.filter(file => file.isFolder)
			let baseFiles = tree.filter(file => !file.isFolder)
		
			let basePromises = []
	
			if(baseFolders.length > 0)
				for(let baseFolder of baseFolders) {
					if(failedPastes.includes(baseFolder)) continue;
					basePromises.push(processNode(baseFolder))
				}
	
			if(baseFiles.length > 0)
				basePromises.push(copyFiles(baseFiles, true))
	
			await Promise.all(basePromises)
			if(failedPastes.length == 0)
				return resolve(true)
			else reject(true)
		})
	}


	(async function main() {
		if(!PastableFromClipboard()) return;

		const pastingFiles = get(clipboardFiles)

		const beginning = new Date()
		let fileTree : models.SysFile[] = [];
		fileTree = await getTree(pastingFiles);

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
			UpdateJob(JOB_ID, GetWord("jobPasteDesc2") + failedPastes.length + Plural(failedPastes.length, GetWord("jobPasteDesc2File")) + (failedPastes.length == 1 ? GetWord("jobPasteDesc2FailedSingular") : GetWord("jobPasteDesc2FailedPlural")), (donePastes * 100 / todoPastes))
		}
		updateJobVisual()
		let progressInterval = setInterval(updateJobVisual, 1000)

		await toast.promise(
			processTree(fileTree),
			{
				loading: GetWord("jobPasteTitle")+" 📋",
				success: GetWord("jobPasteToastSuccess"),
				error: GetWord("jobPasteToastError")
			},
			{
				position:'bottom-left'
			}
		).catch(error => {})
		clearInterval(progressInterval)
		RemoveJob(JOB_ID)
		const end = new Date()

		const diffSeconds = Math.floor((end - beginning) / 1000);
		console.log("Duration:", Math.floor(diffSeconds / 60) + ":" + diffSeconds % 60)
		
		if(failedPastes.length > 0) {
			OpenModal({modalName:"pasteErrorLog", files:failedPastes})
		}
	})()

	return;
}


export function PastableFromClipboard() {
	return get(clipboardFiles).length > 0
}