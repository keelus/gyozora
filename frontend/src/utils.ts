import { GetWord } from "./languages";
import { GetSetting } from "./settings";
import { GenerateToast } from "./toasts";

export function Plural(amount : number, word : string) : string {
	return amount === 1 ? word : word+"s"
}

export function renderBytes(bytes : number) : string {
	if(bytes <= 1_000) return bytes + " B";
	if(bytes <= 1_000_000) return (bytes/1_000).toFixed(2) + " KB";
	if(bytes <= 1_000_000_000) return (bytes/1_000_000).toFixed(2) + " MB";
	if(bytes <= 1_000_000_000_000) return (bytes/1_000_000_000).toFixed(2) + " GB";
	if(bytes <= 1_000_000_000_000_000) return (bytes/1_000_000_000_000).toFixed(2) + " TB";
	return bytes.toString()
}

export function renderDate(dateUnix : number) : string { // TODO: Render for different languages
	const modifTime = new Date(dateUnix * 1000)
	
	const dayWeek = GetWord("day_" + modifTime.getDay())
	const month = GetWord("month_" + modifTime.getMonth())
	const day = modifTime.getDate().toString().padStart(2, '0')
	const year = modifTime.getFullYear()
	const hour = modifTime.getHours().toString().padStart(2, '0')
	const min = modifTime.getSeconds().toString().padStart(2, '0')
	const sec = modifTime.getMinutes().toString().padStart(2, '0')

	if(GetSetting("language") == "EN")
		return `${dayWeek}, ${month} ${day}, ${year}, ${hour}:${min}:${sec}`
	else if(GetSetting("language") == "ES")
		return `${dayWeek}, ${day} de ${month} del ${year}, ${hour}:${min}:${sec}`

	return ""
}

export function copyToClipboard(text : string) {
	navigator.clipboard.writeText(text)
	GenerateToast("success", GetWord("clipboardCopySuccess"), "📋")
}