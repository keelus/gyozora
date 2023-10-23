import NewFileModal from './NewFile.svelte'
import RenameFileModal from './RenameFile.svelte'

export default async function OpenModal(modalName : string) : (Promise<{[key:string] : any}>) {
	const parentModal = document.querySelector(".modalParent")
	if(!parentModal) return;
	
	parentModal.setAttribute("data-activeModal", modalName)

	let result;

	if(modalName == "newFile") {
		const newFileModal = new NewFileModal({target: parentModal});
		result = await newFileModal.WaitForModalResponse();
		newFileModal.$destroy()
	} else if(modalName == "rename") {
		const renameFileModal = new RenameFileModal({target: parentModal});
		result = await renameFileModal.WaitForModalResponse();
		renameFileModal.$destroy()
	}



	parentModal.setAttribute("data-activeModal", "")
	return {content:result, cancelled: result == -1, error: false}
}