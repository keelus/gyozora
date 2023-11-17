<script lang="ts">
import { USER_OS, languageDictionary, selectedFiles, settings } from "../utils/store";
import { IconDictionary } from "../utils/icons";
import { get } from "svelte/store";
  import { onMount } from "svelte";
  import { GetWord } from "../utils/languages";

let cancelButton : HTMLButtonElement;
let confirmButton : HTMLButtonElement;

export async function WaitForModalResponse() {
	return new Promise(resolve => {
		cancelButton.addEventListener("click", () => {
			resolve(-1)
		})
		confirmButton.addEventListener("click", () => {
			resolve(true)
		})
	})
}

let selectedAmount = 1;
let singleFiletype = "file";
onMount(() => {
	selectedAmount = get(selectedFiles).length;
	singleFiletype = get(selectedFiles)[0].isFolder ? GetWord("modalDeleteDesc2") : GetWord("modalDeleteDesc3");
})
</script>
<div class="modal delete">
	<div class="top">
		<div class="title">{GetWord("modalDeleteTitle")}</div>
	</div>
	<div class="middle" style="display:block;">
		{GetWord("modalDeleteDesc")}
		{#if selectedAmount == 1}
			{singleFiletype}?
		{:else}
			{GetWord("modalDeleteDesc1")}?
		{/if}
	</div>
	<div class="bottom">
		<button class="cancel" bind:this={cancelButton}>{GetWord("modalBtnCancel")}</button>
		<button class="confirm" bind:this={confirmButton} style="background-color:#F61C2C;">{GetWord("modalDeleteBtnConfirm")}</button>
	</div>
</div>