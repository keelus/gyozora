import { get } from "svelte/store";
import { settings } from "./store";
import type { models } from "../wailsjs/go/models";
import { Go_LoadSettings, Go_GetSetting, Go_SetSetting, Go_DeleteSetting } from '../wailsjs/go/main/App.js'

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
		console.error(`Setting ${name} cannot have the value ${value}`)
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
	case "colorTheme":
		return "default"
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
	switch(name) {
	// Appearance
	case "theme":
		return value == "dark" || value == "light"
	case "transparency":
		return true //TODO: Check
	case "colorTheme":
		return value == "default"
	// View settings
	case "zoomLevel":
		return true //TODO: Check
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
