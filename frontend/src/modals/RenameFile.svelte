<script lang="ts">
	import type { models } from "../../wailsjs/go/models";

	let filename = "";
	
	let filenameInput : HTMLInputElement;
	let cancelButton : HTMLButtonElement;
	let confirmButton : HTMLButtonElement;


	
	export async function WaitForModalResponse() {
		if(!renamingFile) return new Promise(resolve => resolve(-1)) // TODO: Add error toast
		
		filenameInput.value = renamingFile.filename
		filenameInput.focus()
		
		return new Promise(resolve => {
			cancelButton.addEventListener("click", () => {
				console.log("Modal cancel button")
				resolve(-1)
			})
			confirmButton.addEventListener("click", () => {
				console.log("Modal create button")
				resolve([filename])
			})
		})
	}

	export let renamingFile : models.SysFile | undefined;
</script>
{#if renamingFile !== undefined}
	<div class="modal rename">
		<div class="top">
			<div class="title">Rename {renamingFile.isFolder ? "folder" : "rename"}</div>
		</div>
		<div class="middle">
			<div class="flexContent">
				<input type="text" spellcheck="false" placeholder="New filename and extension..." bind:this={filenameInput} bind:value={filename}>
			</div>
		</div>
		<div class="bottom">
			<button class="cancel" bind:this={cancelButton} >Cancel</button>
			<button class="confirm" bind:this={confirmButton} disabled={filename == ""}>Rename</button>
		</div>
	</div>
{/if}