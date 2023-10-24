<script lang="ts">
import { CURRENT_PATH, USER_OS, selectedFiles } from "../store";
import Icon from 'svelte-icons-pack/Icon.svelte';
import { GetIconByType, IconDictionary } from "../icons";
import { get } from "svelte/store";
import { onMount } from "svelte";
import type { models } from "wailsjs/go/models";
import { PropertiesFile } from '../../wailsjs/go/main/App.js';

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
							<Icon src={GetIconByType(fileData.iconClass)} className="icon {fileData.iconClass} {$USER_OS}"/>
						{/if}
					</div>
					<div class="text" title={fileData.filename}>{fileData.filename}</div>
				</div>
				<div class="divider"></div>
				<div class="doubleField">
					<div class="key">Type</div>
					<div class="text">{fileData.iconClass}</div>
				</div>
				<div class="doubleField">
					<div class="key">Location</div>
					<div class="text" title={fileData.path}>{fileData.path}</div>
				</div>
				{#if !fileData.isFolder}
					<div class="doubleField">
						<div class="key">Size</div>
						<div class="text">{renderBytes(fileData.size)}</div>
					</div>
				{/if}
				<div class="divider"></div>
				<div class="doubleField">
					<div class="key">Modification</div>
					<div class="text">{fileData.modifiedAt}</div>
				</div>
			</div>
		</div>
	{/if}
	<div class="bottom">
		<button class="cancel" style="margin-left:auto;" bind:this={cancelButton}>Close</button>
	</div>
</div>