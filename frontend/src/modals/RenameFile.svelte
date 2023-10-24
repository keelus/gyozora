<script lang="ts">
	let filename = "";
	
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
				resolve([filename])
			})
		})
	}
</script>
<div class="modal rename">
	<div class="top">
		<div class="title">Rename a file</div>
	</div>
	<div class="middle">
		<div class="flexContent">
			<input type="text" placeholder="New filename and extension..." bind:value={filename}>
		</div>
	</div>
	<div class="bottom">
		<button class="cancel" bind:this={cancelButton} >Cancel</button>
		<button class="confirm" bind:this={confirmButton} disabled={filename == ""}>Rename</button>
	</div>
</div>