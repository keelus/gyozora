import { get } from "svelte/store";
import { settings } from "./store";
import type { models } from "../wailsjs/go/models";
import { Go_LoadSettings, Go_GetSetting, Go_SetSetting, Go_DeleteSetting } from '../wailsjs/go/main/App.js'
import { GenerateToast } from "./toasts";

export const MIN_ZOOM = 50;
export const MAX_ZOOM = 150;
export const INC_ZOOM = 5;

export async function LoadSettings() {
	const loadedSettings = await Go_LoadSettings()
	
	settings.update(stngs => {
		return loadedSettings;
	})
	console.log("Loaded settings")
}

export function GetSetting(name : string) {
	let curSettings = get(settings)
	
	if(curSettings[name] === undefined)
		return GetDefaultSetting(name)
	else return curSettings[name]
}

export async function SetSetting(name : string, value : string) {
	if(!IsValidSetting(name, value)) {
		GenerateToast("error", "That setting cannot have that value.", "⚙️")
		return
	}

	if(GetDefaultSetting(name) == value) { // If setting default, we can delete it
		await Go_DeleteSetting(name)
	} else {
		const error : models.SimpleError = await Go_SetSetting(name, value)
		if(error.status) return

	}


	settings.update(settngs => {
		settngs[name] = value;
		return settngs;
	})
}


function GetDefaultSetting(name : string) : string {
	switch(name){
	// Appearance
	case "theme":
		return "dark"
	case "transparency":
		return "0"
	// View settings
	case "zoomLevel":
		return "100"
	case "showExtensions":
		return "true"
	case "showHiddenFiles":
		return "true"
	// Accessibility
	case "language":
		return "EN"
	case "showBreadcrumbs":
		return "true"
	case "showDeleteConfirmation":
		return "true"
	case "fastAccessFolders":
		return "TBD-1"
	// Image Previews
	case "useThumbnails":
		return "true"
	case "useCache": // false if useThumbnails==false
		return "true"
	// TODO: Shortcuts?
	default:
		return ""
	}
}

function IsValidSetting(name : string, value : string) : boolean {
	const valueInt = parseInt(value)
	switch(name) {
	// Appearance
	case "theme":
		return value == "dark" || value == "light"
	case "transparency":
		return valueInt >= 0 && valueInt <= 100
	// View settings
	case "zoomLevel":
		return valueInt >= MIN_ZOOM && valueInt <= MAX_ZOOM
	case "showExtensions":
		return value == "true" || value == "false"
	case "showHiddenFiles":
		return value == "true" || value == "false"
	// Accessibility
	case "language":
		return value == "EN" || value == "ES"
	case "showBreadcrumbs":
		return value == "true" || value == "false"
	case "showDeleteConfirmation":
		return value == "true" || value == "false"
	case "fastAccessFolders":
		return true
	// Image Previews
	case "useThumbnails":
		return value == "true" || value == "false"
	case "useCache": // false if useThumbnails==false
		return value == "true" || value == "false"
	// TODO: Shortcuts?
	default:
		return true
	}
}

export function ZoomIn() {
	const newZoom = parseInt(GetSetting("zoomLevel")) + INC_ZOOM
	SetSetting("zoomLevel", newZoom.toString())
}

export function ZoomOut() {
	const newZoom = parseInt(GetSetting("zoomLevel")) - INC_ZOOM
	SetSetting("zoomLevel", newZoom.toString())
}