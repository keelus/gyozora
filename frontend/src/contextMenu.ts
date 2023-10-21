import { get } from "svelte/store";
import { selectedFiles, fileContextMenuOptions } from "./store";

export async function openFileContextMenu(fileContextMenu : HTMLDivElement, coordinates : {[key:string]:number}, file : Element) {
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