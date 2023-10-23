export default async function OpenModal(modalName : string) : (Promise<{[key:string] : any}>) {
	const parentModal = document.querySelector(".modalParent")
	if(!parentModal) return {error: true};
	const targetModal = parentModal.querySelector(`.modal.${modalName}`)
	if(!targetModal) return {error: true};
	
	console.log("🪟 Opening the modal")

	parentModal.setAttribute("data-activeModal", modalName)
	const result = await WaitForModalResponse(targetModal)
	parentModal.setAttribute("data-activeModal", "")

	return {content:result, cancelled: false, error: false}
}

// TODO: Depending on the modal type, define this. For now:
async function WaitForModalResponse(tgtModal : Element) {
	return new Promise(resolve => {
		const cancelButton = tgtModal.querySelector(".bottom > button.cancel")
		const confirmButton = tgtModal.querySelector(".bottom > button.confirm")
		const filenameInput = tgtModal.querySelector(".middle > input") as HTMLInputElement
		if(!cancelButton || !confirmButton || !filenameInput) return

		filenameInput.value = ""
		filenameInput.focus()

		cancelButton.addEventListener("click", () => {
			console.log("Modal cancel button")
			resolve(-1)
		})
		confirmButton.addEventListener("click", () => {
			console.log("Modal create button")
			const activeType = tgtModal.getAttribute("data-activeType") // Only for new modal TODO: better
			tgtModal.setAttribute("data-activeType", "file") // TODO fix
			resolve([filenameInput.value, activeType])
		})
	})
}