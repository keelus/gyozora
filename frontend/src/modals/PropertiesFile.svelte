<script lang="ts">
import { CURRENT_PATH, USER_OS, selectedFiles } from "../store";
import Icon from "@iconify/svelte";
import { GetIconByType, IconDictionary } from "../icons";
import { get } from "svelte/store";
import { onMount } from "svelte";
import type { models } from "wailsjs/go/models";
import { PropertiesFile } from '../../wailsjs/go/main/App.js';
import { GenerateToast } from "../../src/toasts";

let cancelButton : HTMLButtonElement;

export async function WaitForModalResponse() {
	return new Promise(resolve => {
		cancelButton.addEventListener("click", () => {
			console.log("Modal cancel button")
			resolve(-1)
		})
	})
}

let fileData : models.SysFile;
onMount(async () => {
	if(get(selectedFiles).length === 0) // Right clicked current folder
		fileData = await PropertiesFile(get(CURRENT_PATH))
	else 
		fileData = get(selectedFiles)[0]
})

function renderBytes(bytes : number) : string {
	if(bytes <= 1_000) return bytes + " B";
	if(bytes <= 1_000_000) return (bytes/1_000).toFixed(2) + " KB";
	if(bytes <= 1_000_000_000) return (bytes/1_000_000).toFixed(2) + " MB";
	if(bytes <= 1_000_000_000_000) return (bytes/1_000_000_000).toFixed(2) + " GB";
	if(bytes <= 1_000_000_000_000_000) return (bytes/1_000_000_000_000).toFixed(2) + " TB";
	return bytes.toString()
}

function renderDate(dateUnix : number) : string {
	const modifTime = new Date(dateUnix * 1000)

	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October","November","December"]
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


	return `${days[modifTime.getDay()]}, ${months[modifTime.getMonth()]} ${modifTime.getDate().toString().padStart(2, '0')}, ${modifTime.getFullYear()}, ${modifTime.getHours().toString().padStart(2, '0')}:${modifTime.getMinutes().toString().padStart(2, '0')}:${modifTime.getSeconds().toString().padStart(2, '0')}`
}

function copyToClipboard(text : string) {
	navigator.clipboard.writeText(text)
	GenerateToast("success", "Copied to clipboard", "📋")
}

</script>
<div class="modal properties">
	{#if fileData !== undefined}
		<div class="top">
			<div class="title">Properties of {fileData.filename}</div>
		</div>
		<div class="middle" style="display:block;">
			<div class="flexContent">
				<div class="doubleField">
					<div class="key">
						{#if fileData.iconClass == "fileImage" && fileData.preview != ""}
							<div class="imagePreview" style="background-image:url(data:image/png;base64,{fileData.preview});{fileData.extension == ".svg" ? "background-color:white;" : ""}"></div>
						{:else}
						
							<Icon icon={GetIconByType(fileData.iconClass)} class="icon {fileData.iconClass} {$USER_OS}"/>
						{/if}
					</div>
					<button class="value" on:click={() => copyToClipboard(fileData.filename)}>
						<div class="text" title={fileData.filename}>{fileData.filename}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				<div class="divider"></div>
				<div class="doubleField">
					<div class="key">Type</div>
					<button class="value" on:click={() => copyToClipboard(fileData.iconClass)}>
						<div class="text" title={fileData.iconClass}>{fileData.iconClass}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				<div class="doubleField">
					<div class="key">Location</div>
					<button class="value" on:click={() => copyToClipboard(fileData.path)}>
						<div class="text" title={fileData.path}>{fileData.path}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				<div class="doubleField">
					<div class="key">full location</div>
					<button class="value" on:click={() => copyToClipboard(fileData.path)}>
						<div class="text" title={fileData.pathfull}>{fileData.pathfull}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				<div class="doubleField">
					<div class="key">Rel location</div>
					<button class="value" on:click={() => copyToClipboard(fileData.path)}>
						<div class="text" title={fileData.pathrelativefull}>{fileData.pathrelativefull}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				{#if !fileData.isFolder}
					<div class="doubleField">
						<div class="key">Size</div>
						<button class="value" on:click={() => copyToClipboard(renderBytes(fileData.size))}>
							<div class="text" title={renderBytes(fileData.size)}>{renderBytes(fileData.size)}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
						</button>
					</div>
				{/if}
				<div class="divider"></div>
				<div class="doubleField">
					<div class="key">Modification</div>
					<button class="value" on:click={() => copyToClipboard(renderDate(fileData.modifiedAt))}>
						<div class="text" style="font-size:13px;" title={renderDate(fileData.modifiedAt)}>{renderDate(fileData.modifiedAt)}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
			</div>
		</div>
	{/if}
	<div class="bottom">
		<button class="cancel" style="margin-left:auto;" bind:this={cancelButton}>Close</button>
	</div>
</div>