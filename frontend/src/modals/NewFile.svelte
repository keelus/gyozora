<script lang="ts">
import { USER_OS } from "../store";
import Icon from "@iconify/svelte";
import { GetIconByType } from "../icons";
import { get } from "svelte/store";

let filename = "";
let activeFileType = "file";

let filenameInput : HTMLInputElement;

let cancelButton : HTMLButtonElement;
let confirmButton : HTMLButtonElement;

export async function WaitForModalResponse() {
	filenameInput.focus()

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
		<div class="title">Create a new file</div>
	</div>
	<div class="middle" style="padding:0 !important;">
		<div class="flexContent">
			<div class="categoryTitle">Type of file</div>
			<!-- <div class="message"></div> -->
			<div class="typeOptions">
				<button class="option {activeFileType == "file" ? "active" : "" }" on:click={() => activeFileType="file"}>
					<Icon icon={GetIconByType("file")} class="icon file {$USER_OS}"/>
					<div class="text">File</div>
				</button>
				<button class="option {activeFileType == "folder" ? "active" : "" }" on:click={() => activeFileType="folder"}>
					<Icon icon={GetIconByType("folder")} class="icon folder {$USER_OS}"/>
					<div class="text">Folder</div>
				</button>
			</div>
			<div class="categoryTitle" style="margin-top:10px;">Filename</div>
			<input type="text" spellcheck="false" placeholder="Filename and extension..." bind:this={filenameInput} bind:value={filename}>
		</div>
	</div>
	<div class="bottom">
		<button class="cancel" bind:this={cancelButton}>Cancel</button>
		<button class="confirm" bind:this={confirmButton} disabled={filename == ""}>Create</button>
	</div>
</div>