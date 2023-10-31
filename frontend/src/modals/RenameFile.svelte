<script lang="ts">
  import { languageDictionary, settings } from "../store";
	import type { models } from "../../wailsjs/go/models";
  import { GetWord } from "../languages";

	let filename = "";
	
	let filenameInput : HTMLInputElement;
	let cancelButton : HTMLButtonElement;
	let confirmButton : HTMLButtonElement;


	
	export async function WaitForModalResponse() {
		if(!renamingFile) return new Promise(resolve => resolve(-1))
		
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
			<div class="title">{GetWord("modalRenameTitle")} {renamingFile.isFolder ? GetWord("modalRenameTypeFolder") : GetWord("modalRenameTypeFile")}</div>
		</div>
		<div class="middle">
			<div class="flexContent">
				<input type="text" spellcheck="false" placeholder="{GetWord("modalRenameInputPlaceholder")}" bind:this={filenameInput} bind:value={filename}>
			</div>
		</div>
		<div class="bottom">
			<button class="cancel" bind:this={cancelButton} >{GetWord("modalBtnCancel")}</button>
			<button class="confirm" bind:this={confirmButton} disabled={filename == ""}>{GetWord("modalRenameBtnConfirm")}</button>
		</div>
	</div>
{/if}