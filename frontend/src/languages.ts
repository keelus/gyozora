import { GetSetting } from "./settings";
import { languageDictionary } from "./store";
import { Go_LoadDictionary } from '../wailsjs/go/main/App.js'
import { get } from "svelte/store";

export function GetWord(key : string){
	const currentLanguage = GetSetting("language");

	if(Object.entries(get(languageDictionary)).length == 0){
		return ""
	}

	const word = get(languageDictionary)[currentLanguage][key] || "WORD_ERR"

	return word	
}

export async function LoadDictionary() {
	const dict = await Go_LoadDictionary();

	console.log("Loaded language dictionary:")
	console.log(dict)

	languageDictionary.update(d => {
		return dict;
	})
}