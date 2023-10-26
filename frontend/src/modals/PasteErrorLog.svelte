<script lang="ts">
  import type { models } from "../../wailsjs/go/models";

	
	let cancelButton : HTMLButtonElement;
	
	export async function WaitForModalResponse() {
		return new Promise(resolve => {
			cancelButton.addEventListener("click", () => {
				console.log("Modal cancel button")
				resolve(-1)
			})
		})
	}

	export let failed : models.SysFile[] = [];
</script>
	<div class="modal pasteErrorLog">
		<div class="top">
			<div class="title">Paste error log</div>
		</div>
		<div class="middle" style="padding:0 !important;">
			<div class="flexContent">
				<div class="note">The following files could not be pasted:</div>
				<div class="files">
					{#each failed as fail}
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