<script lang="ts">
import { USER_OS } from "../store";
import Icon from 'svelte-icons-pack/Icon.svelte';
import { IconDictionary } from "../icons";
import { get } from "svelte/store";

let filename = "";
let activeFileType = "file";

let cancelButton : HTMLButtonElement;
let confirmButton : HTMLButtonElement;

export async function WaitForModalResponse() {
	return new Promise(resolve => {
		cancelButton.addEventListener("click", () => {
			console.log("Modal cancel button")
			resolve(-1)
		})
		confirmButton.addEventListener("click", () => {
			console.log("Modal create button")
			resolve([filename, activeFileType])
		})
	})
}
</script>
<div class="modal newFile">
	<div class="top">
		<div class="title">Create a new file yes!</div>
	</div>
	<div class="middle">
		<div class="categoryTitle">Type of file</div>
		<!-- <div class="message"></div> -->
		<div class="typeOptions">
			<button class="option {activeFileType == "file" ? "active" : "" }" on:click={() => activeFileType="file"}>
				<Icon src={IconDictionary["file"]} className="icon file {get(USER_OS)}"/>
				<div class="text">File</div>
			</button>
			<button class="option {activeFileType == "folder" ? "active" : "" }" on:click={() => activeFileType="folder"}>
				<Icon src={IconDictionary["folder"]} className="icon folder {get(USER_OS)}"/>
				<div class="text">Folder</div>
			</button>
		</div>
		<div class="categoryTitle" style="margin-top:10px;">Filename</div>
		<input type="text" placeholder="Filename and extension..." bind:value={filename}>
	</div>
	<div class="bottom">
		<button class="cancel" bind:this={cancelButton}>Cancel</button>
		<button class="confirm" bind:this={confirmButton} disabled={filename == ""}>Create</button>
	</div>
</div>