<script lang="ts">
  import { languageDictionary, settings } from "../store";
  import type { models } from "../../wailsjs/go/models";
  import { GetWord } from "../languages";

	
	let cancelButton : HTMLButtonElement;
	
	export async function WaitForModalResponse() {
		return new Promise(resolve => {
			cancelButton.addEventListener("click", () => {
				resolve(-1)
			})
		})
	}

	export let failedFiles : models.SysFile[];
</script>
	<div class="modal pasteErrorLog">
		<div class="top">
			<div class="title">{GetWord("modalPasteErrorTitle")}</div>
		</div>
		<div class="middle" style="padding:0 !important;">
			<div class="flexContent">
				<div class="note">{GetWord("modalPasteErrorDesc")}:</div>
				<div class="files">
					{#each failedFiles as fail}
					<div class="file">
						<div class="filename" title={fail.filename}>{fail.filename}</div>
						<div class="path" title={fail.filename}>{fail.path}</div>
					</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="bottom">
			<button class="cancel" style="margin-left:auto;" bind:this={cancelButton}>Close</button>
		</div>
	</div>