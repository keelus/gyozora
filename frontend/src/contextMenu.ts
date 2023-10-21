import { get } from "svelte/store";
import { selectedFiles, fileContextMenuOptions, CURRENT_PATH, contents } from "./store";
import { OpenFile, AddFile, CutFile_s, CopyFile_s, PasteFile_s, RenameFile, DeleteFile_s, PropertiesFile } from '../wailsjs/go/main/App.js'
import OpenModal from "./modal";
import type { models } from 'wailsjs/go/models.js';

export async function openFileContextMenu(fileContextMenu : HTMLDivElement, coordinates : {[key:string]:number}, file : Element | null) {
	fileContextMenu.classList.add("opened")

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

	if(mode == "none") {
		fileContextMenuOptions.update(options => {
		  return {
			...options,
			open: { show: false, disabled: false },
			cut: { show: false, disabled: false },
			copy: { show: false, disabled: false },
			paste: { show: true, disabled: true },  // Check clipboard
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
			paste: { show: true, disabled: true }  // Check clipboard
		  };
		});
	}

	if(mode == "multiple") {
		fileContextMenuOptions.update(options => {
		  return {
			...options,
			add: { show: false, disabled: false },
			open: { show: false, disabled: false },
			paste: { show: true, disabled: true },  // Check clipboard
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
			OpenFile(selFiles[0].pathfull)
		break;
		case "add":
			const modalResponse = await OpenModal("newFile")
			if(!modalResponse?.cancelled)
				console.log("🔥", modalResponse)
			else
				console.warn("Modal canceled :(")

			// Dialog...
			const actionResponse : models.ActionResponse = await AddFile(get(CURRENT_PATH), modalResponse?.content)
			if(actionResponse.error.status) { // TODO: Show toast?
				if(actionResponse.error.reason) return console.error("File creation err:", actionResponse.error.reason)
				return console.error("Unexpected error while creating the file.")
			}
			contents.update(cts => {
				cts.push(actionResponse.file)
				return cts
			})
		break;
		case "cut":
		break;
		case "copy":
		break;
		case "paste":
		break;
		case "rename":
		break;
		case "delete":
		break;
		case "properties":
		break;
		default:
			console.log("📛 unknown action")
		break;
	}
}