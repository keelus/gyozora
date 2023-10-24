<script lang="ts">
import { USER_OS, selectedFiles } from "../store";
import Icon from 'svelte-icons-pack/Icon.svelte';
import { IconDictionary } from "../icons";
import { get } from "svelte/store";
  import { onMount } from "svelte";

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
			resolve(true)
		})
	})
}

let selectedAmount = 1;
let singleFiletype = "file";
onMount(() => {
	selectedAmount = get(selectedFiles).length;
	singleFiletype = get(selectedFiles)[0].isFolder ? "folder and its contents" : "file";
})

</script>
<div class="modal delete">
	<div class="top">
		<div class="title">Delete a new file</div>
	</div>
	<div class="middle" style="display:block;">
		Are you sure you want to delete
		{#if selectedAmount == 1}
			the {singleFiletype}?
		{:else}
			{selectedAmount} files?
		{/if}
	</div>
	<div class="bottom">
		<button class="cancel" bind:this={cancelButton}>Cancel</button>
		<button class="confirm" bind:this={confirmButton} style="background-color:#F61C2C;">Delete</button>
	</div>
</div>