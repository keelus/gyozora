<script lang="ts">
// Wails/backend functions & models
import { GetStartingPath, LoadPinnedFolders, LoadYourComputer, GetUserOS } from '../wailsjs/go/main/App.js'
import { BrowserOpenURL } from '../wailsjs/runtime/runtime'
import type { models } from 'wailsjs/go/models.js';
// Gyozora icons
import favicon from "./assets/icons/favicon.ico"
import appicon from './assets/icons/gyozora.svg'

// UI Icons
import Icon from 'svelte-icons-pack/Icon.svelte';
import { Home, File, HardDrive, ArrowLeft, ArrowRight, Folder, ChevronRight } from 'lucide-svelte';

// Gyozora browser, icons & logic
import { contents, selectedFiles, fileContextMenuOptions, CURRENT_PATH, goBackEnabled, goForwardEnabled, previewProgress, USER_OS, CURRENT_PATH_BREADCRUMB_ELEMENTS } from "./store";
import { LoadFolder, buttonGoBack, buttonGoForward, elementClicked, addToSelected } from "./pathManager";
import { IconDictionary, GetIconByType } from "./icons";
import { closeFileContextMenu, openFileContextMenu, doAction } from "./contextMenu";

import toast, { Toaster } from 'svelte-french-toast';
import { GenerateToast } from './toasts.js';


let pinnedFolders : models.LeftBarElement[] = []
let yourComputer : models.LeftBarElement[] = []

let fileBrowser : HTMLDivElement;
let fileContextMenu : HTMLDivElement;
let modalParent : HTMLDivElement;

let newFileActiveType : string = "file";

import TestModal from './modals/NewFile.svelte'
  import { CopyToClipboard, PasteFromClipboard } from './clipboard.js';


document.addEventListener("DOMContentLoaded", FirstStart)
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener("keyup", e => e.key == "PageUp" && FirstStart()) // For debug
document.addEventListener("mousedown", e => (e.button === 3 && buttonGoBack()) || (e.button === 4 && buttonGoForward()));
document.addEventListener("keyup", e => e.key == "Delete" && doAction("delete"));
document.addEventListener("keydown", e => {
	if(e.shiftKey && e.ctrlKey && e.key == "N"){ // For folder by default creating
		e.preventDefault()
		doAction("add")
	}
	if(e.key == "Enter"){
		const activeModal = modalParent.getAttribute("data-activeModal")
		if(activeModal == "")
			doAction("open")
		else {
			const confirmButton = modalParent.querySelector(`.${activeModal} > .bottom > button.confirm`) as HTMLButtonElement
			if(confirmButton) confirmButton.click()
		}
	} else if(e.key == "Escape"){
		const activeModal = modalParent.getAttribute("data-activeModal")
		if(activeModal == "")
			$selectedFiles = []
		else {
			const cancelButton = modalParent.querySelector(`.${activeModal} > .bottom > button.cancel`) as HTMLButtonElement
			if(cancelButton) cancelButton.click()
		}
	}
});
document.addEventListener("copy", e => {
	if(e.target != document.body) return;
	CopyToClipboard();
})
document.addEventListener("paste", e => {
	if(e.target != document.body) return;
	PasteFromClipboard();
})


async function FirstStart() {
	console.log("✌️👻 Hi")
	USER_OS.set(await GetUserOS());
	$CURRENT_PATH = await GetStartingPath()
	pinnedFolders = await LoadPinnedFolders()
	yourComputer = await LoadYourComputer()
	LoadFolder($CURRENT_PATH, false, false, true)
}


$: if (fileBrowser) {
	fileBrowser.addEventListener("mouseup", (e : MouseEvent) => {
		let clickedTarget = e.target as HTMLElement;
		if(!clickedTarget) return;
		let clickedFile = clickedTarget.closest("button.file")
		let clickedCtxMenu = clickedTarget.closest(".fileContextMenu")
		
		if($USER_OS == "darwin") {
			if(e.button == 0 && ! e.ctrlKey){ // Left click
				closeFileContextMenu(fileContextMenu)
				if(!clickedCtxMenu) // Prevent doAction for receiving an empty $selectedFiles & let doAction selectFiles depending on clicked mode
					if(!clickedFile) $selectedFiles = []
			} else if (e.button == 0 && e.ctrlKey) { // Right click
				openFileContextMenu(fileContextMenu, {x:e.clientX, y:e.clientY}, clickedFile)
			}
		} else {
			if(e.button == 0){ // Left click
				closeFileContextMenu(fileContextMenu)
				if(!clickedCtxMenu) // Prevent doAction for receiving an empty $selectedFiles & let doAction selectFiles depending on clicked mode
					if(!clickedFile) $selectedFiles = []
			} else if (e.button == 2) { // Right click
				openFileContextMenu(fileContextMenu, {x:e.clientX, y:e.clientY}, clickedFile)
			}
		}
	})
}

let temporalFilenameInputValue = "";
let filenameRenameInputValue = "";


</script>

<link rel="shortcut icon" href={favicon} type="image/x-icon">
<main data-user-os={$USER_OS}>
	<div class="appTitleBar" style="widows: 1;"></div>
	<Toaster containerStyle="margin-bottom:10px;"/>
	<div class="toolbar"></div>
	<div class="pathbar">
		<button class="backButton" disabled={!$goBackEnabled} on:click={buttonGoBack}><ArrowLeft class="icon"/></button>
		<button class="forwardButton" disabled={!$goForwardEnabled} on:click={buttonGoForward}><ArrowRight class="icon" /></button>
		<input class="path" placeholder="Current path..." value={$CURRENT_PATH} disabled/>
		<input class="search" placeholder="Search here" type="text"/>
	</div>
	<div class="mainContent">
		<div class="navPane"><div class="section">
			<div class="elements">
				<div class="element">
					<Home class="icon home"/>
					<div class="text">Home</div>
				</div>
			</div>
		</div>
			<div class="section">
				<div class="title"><span class="text">Pinned folder</span></div>
				<div class="elements">
				{#if pinnedFolders.length == 0}
					<div class="emptyMessage">No pinned folders found 👎</div>
				{/if}
					{#each pinnedFolders as content}
						<button class="element {$CURRENT_PATH == content.path ? "active" : ""}" on:click={() => elementClicked(content.path, true)}>
							<Icon src={IconDictionary[content.type]} className="icon {content.type} {$USER_OS}"/>
							<div class="text">{content.name}</div>
						</button>
					{/each}
				</div>
			</div>
			<div class="section">
				<div class="title"><span class="text">Your computer</span></div>
				<div class="elements">
				{#if yourComputer.length == 0}
					<div class="emptyMessage">No system roots/disks found 👎</div>
				{/if}
				{#each yourComputer as content}
					<button class="element" on:click={() => elementClicked(content.path, true)}>
						<Icon src={IconDictionary[content.type]} className="icon {content.type} {$USER_OS}"/>
						<div class="text">{content.name}</div>
					</button>
				{/each}
				</div>
			</div>
		</div>

	<div class="fileBrowser" bind:this={fileBrowser}>
		<div class="fileContextMenu" bind:this={fileContextMenu}>
			<button class:disabled={$fileContextMenuOptions.add.disabled} class:hide={!$fileContextMenuOptions.add.show} class="element" on:click={() => doAction("add")}>
				<Icon src={IconDictionary.ctxMenuAdd} className="icon add" />
				<span class="text">Add</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.open.disabled} class:hide={!$fileContextMenuOptions.open.show} class="element"on:click={() => doAction("open")}>
				<Icon src={IconDictionary.ctxMenuOpen} className="icon open" />
				<span class="text">Open</span>
			</button>
			<div class:hide={!$fileContextMenuOptions.add.show && !$fileContextMenuOptions.open.show} class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.cut.disabled} class:hide={!$fileContextMenuOptions.cut.show} class="element"on:click={() => doAction("cut")}>
				<Icon src={IconDictionary.ctxMenuCut} className="icon cut" />
				<span class="text">Cut</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.copy.disabled} class:hide={!$fileContextMenuOptions.copy.show} class="element"on:click={() => doAction("copy")}>
				<Icon src={IconDictionary.ctxMenuCopy} className="icon copy" />
				<span class="text">Copy</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.paste.disabled} class:hide={!$fileContextMenuOptions.paste.show} class="element"on:click={() => doAction("paste")}> <!-- Allow only if clicked on body, not on file -->
				<Icon src={IconDictionary.ctxMenuPaste} className="icon paste" />
				<span class="text">Paste</span> 
			</button>
			<div class:hide={!$fileContextMenuOptions.rename.show && !$fileContextMenuOptions.delete.show} class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.rename.disabled} class:hide={!$fileContextMenuOptions.rename.show} class="element"on:click={() => doAction("rename")}>
				<Icon src={IconDictionary.ctxMenuRename} className="icon rename" />
				<span class="text">Rename</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.delete.disabled} class:hide={!$fileContextMenuOptions.delete.show} class="element"on:click={() => doAction("delete")}>
				<Icon src={IconDictionary.ctxMenuDelete} className="icon delete" />
				<span class="text">Delete</span>
			</button>
			<div class:hide={!$fileContextMenuOptions.properties.show} class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.properties.disabled} class:hide={!$fileContextMenuOptions.properties.show} class="element"on:click={() => doAction("properties")}>
				<Icon src={IconDictionary.ctxMenuProperties} className="icon properties" />
				<span class="text">Properties</span>
			</button>
		</div>
		{#if $contents.length == 0}
			<div class="emptyMessage">No files found here 👎</div>
		{/if}
		{#each $contents as content}
			{#if content != undefined}
				<button class="file {$selectedFiles.includes(content) ? "selected" : ""}" title="{content.filename}" on:dblclick={() => elementClicked(content.pathfull, content.isFolder)} on:mouseup={e => addToSelected(e, content)}>
					{#if content.iconClass == "fileImage" && content.preview != ""}
						<div class="imagePreview" style="background-image:url(data:image/png;base64,{content.preview});{content.extension == ".svg" ? "background-color:white;" : ""}"></div>
					{:else}
						<Icon src={GetIconByType(content.iconClass)} className="icon {content.iconClass} {$USER_OS}"/>
					{/if}
					<div class="text">{content ? content.filename : "Error"}</div>
				</button>
			{/if}
		{/each}
		</div>
	</div>
	<div class="loader">
	<div class="progress" style="--loadProgress:{$previewProgress == "100" || $previewProgress == "100.00" ? "0" : $previewProgress}%;"></div>
</div>
<div class="bottom">
	<div class="breadcrumbs">
		{#each $CURRENT_PATH_BREADCRUMB_ELEMENTS as breadcrumb}
			<button class="breadcrumb" on:click={() => elementClicked(breadcrumb.pathfull, breadcrumb.isFolder)}>
				<Icon src={GetIconByType(breadcrumb.iconClass)} className="icon {breadcrumb.iconClass} {$USER_OS}"/>
				<div class="text">{breadcrumb.filename}</div>
			</button>
			{#if $CURRENT_PATH_BREADCRUMB_ELEMENTS[$CURRENT_PATH_BREADCRUMB_ELEMENTS.length - 1] !== breadcrumb}
				<ChevronRight class="icon"/>
			{/if}
		{/each}
	</div>

	{#if $previewProgress != "100" && $previewProgress != "100.00"}
		<div class="percent">Loading preview: {$previewProgress}%</div>
	{/if}

	<div class="right">
		<button class="logo" on:click={() => BrowserOpenURL("https://github.com/keelus/gyozora")}><img src={appicon} alt="Gyozora icon" class="appicon"/> <span class="appname">Gyozora</span> <span class="version">· {APP_VERSION}</span></button>
	</div>
</div>
<div class="modalParent" data-activeModal="" bind:this={modalParent}>
</div>
</main>