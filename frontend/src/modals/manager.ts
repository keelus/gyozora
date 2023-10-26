import NewFileModal from './NewFile.svelte'
import RenameFileModal from './RenameFile.svelte'
import DeleteFileModal from './DeleteFile.svelte'
import PropertiesFileModal from './PropertiesFile.svelte'
import PasteErrorLog from './PasteErrorLog.svelte'
import { models } from '../../wailsjs/go/models'
export default async function OpenModal(modalName : string, faila : models.SysFile[] = []) : (Promise<{[key:string] : any}>) {
	const parentModal = document.querySelector(".modalParent")
	if(!parentModal) return {error: true};
	
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
	} else if(modalName == "delete") {
		const deleteFileModal = new DeleteFileModal({target: parentModal});
		result = await deleteFileModal.WaitForModalResponse();
		deleteFileModal.$destroy()
	} else if(modalName == "properties") {
		const propertiesFileModal = new PropertiesFileModal({target: parentModal});
		result = await propertiesFileModal.WaitForModalResponse();
		propertiesFileModal.$destroy()
	} else if(modalName == "pasteErrorLog") {
		const pasteErrorLog = new PasteErrorLog({
			target: parentModal,
			props: {
				failed: faila,
			},
			});
		result = await pasteErrorLog.WaitForModalResponse();
		pasteErrorLog.$destroy()
	}



	parentModal.setAttribute("data-activeModal", "")
	return {content:result, cancelled: result == -1, error: false}
}