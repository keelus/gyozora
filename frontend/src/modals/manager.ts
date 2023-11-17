import NewFileModal from './NewFile.svelte'
import RenameFileModal from './RenameFile.svelte'
import DeleteFileModal from './DeleteFile.svelte'
import PropertiesFileModal from './PropertiesFile.svelte'
import PasteErrorLog from './PasteErrorLog.svelte'
import { models } from '../../wailsjs/go/models'
import DeleteErrorLog from './DeleteErrorLog.svelte'
export default async function OpenModal({ modalName, file, files = [] }: { modalName: string, file: models.SysFile | undefined, files?: models.SysFile[] }): Promise<{ [key: string]: any }> {
	const parentModal = document.querySelector(".modalParent")
	if(!parentModal) return {error: true};
	
	parentModal.setAttribute("data-activeModal", modalName)

	let result : any = -1;

	switch(modalName){
		case "newFile":
			if(!IsManualModalOpened(parentModal)){
				const newFileModal = new NewFileModal({target: parentModal});
				result = await newFileModal.WaitForModalResponse();
				newFileModal.$destroy()
			}
			break;
		case "rename":
			if(!IsManualModalOpened(parentModal)){
				const renameFileModal = new RenameFileModal({target: parentModal, props: {renamingFile: file,}});
				result = await renameFileModal.WaitForModalResponse();
				renameFileModal.$destroy()
			}
			break;
		case "delete":
			if(!IsManualModalOpened(parentModal)){
				const deleteFileModal = new DeleteFileModal({target: parentModal});
				result = await deleteFileModal.WaitForModalResponse();
				deleteFileModal.$destroy()
			}
			break;
		case "properties":
			if(!IsManualModalOpened(parentModal)){
				const propertiesFileModal = new PropertiesFileModal({target: parentModal, props: {propertiesFile: file,}});
				result = await propertiesFileModal.WaitForModalResponse();
				propertiesFileModal.$destroy()
			}
			break;
		case "pasteErrorLog":
			const pasteErrorLog = new PasteErrorLog({target: parentModal, props: {failedFiles: files,}});
			result = await pasteErrorLog.WaitForModalResponse();
			pasteErrorLog.$destroy()
			break;
		case "deleteErrorLog":
			const deleteErrorLog = new DeleteErrorLog({target: parentModal, props: {failedFiles: files,}});
			result = await deleteErrorLog.WaitForModalResponse();
			deleteErrorLog.$destroy()
			break;
	}

	if(parentModal.childElementCount == 0)
		parentModal.setAttribute("data-activeModal", "")

	return {content:result, cancelled: result == -1, error: false}
}

// Checks if user has already opened a manual modal (non error modals)
function IsManualModalOpened(parentModal : Element) : boolean {
	const modalNames = ["newFile", "rename", "delete", "properties"]

	let opened = false;

	for(const modal of Array.from(parentModal.children)) {
		if(modalNames.includes(modal.classList[1])){
			opened = true;
			break
		}
	}

	return opened;
}