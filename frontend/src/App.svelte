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
import { contents, selectedFiles, fileContextMenuOptions, CURRENT_PATH, goBackEnabled, goForwardEnabled, previewProgress } from "./store";
import { LoadFolder, buttonGoBack, buttonGoForward, elementClicked, addToSelected } from "./pathManager";
import { IconDictionary, GetIconByType } from "./icons";
import { closeFileContextMenu, openFileContextMenu, doAction } from "./contextMenu";

import toast, { Toaster } from 'svelte-french-toast';
import { GenerateToast } from './toasts.js';

let USER_OS : string = "windows";

let pinnedFolders : models.LeftBarElement[] = []
let yourComputer : models.LeftBarElement[] = []

let fileBrowser : HTMLDivElement;
let fileContextMenu : HTMLDivElement;
let modalParent : HTMLDivElement;


document.addEventListener("DOMContentLoaded", FirstStart)
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener("keyup", e => e.key == "PageUp" && FirstStart()) // For debug
document.addEventListener("keyup", e => e.key == "Escape" && ($selectedFiles = []))
document.addEventListener("mousedown", e => (e.button === 3 && buttonGoBack()) || (e.button === 4 && buttonGoForward()));
document.addEventListener("keyup", e => e.key == "Delete" && doAction("delete"));
document.addEventListener("keydown", e => {
	if(e.shiftKey && e.ctrlKey && e.key == "N"){ // For folder by default creating
		e.preventDefault()
		doAction("add")
	}
	if(e.key == "Enter"){ // For folder by default creating
		const activeModal = modalParent.getAttribute("data-activeModal")
		if(activeModal == "")
			doAction("open")
		else {
			const confirmButton = modalParent.querySelector(`.${activeModal} > .bottom > button.confirm`) as HTMLButtonElement
			confirmButton.click()
		}
	}
});


async function FirstStart() {
	console.log("✌️👻 Hi")
	USER_OS = await GetUserOS();
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
		
		if(e.button == 0){ // Left click
			closeFileContextMenu(fileContextMenu)
			if(!clickedCtxMenu) // Prevent doAction for receiving an empty $selectedFiles & let doAction selectFiles depending on clicked mode
				if(!clickedFile) $selectedFiles = []
		} else if (e.button == 2) { // Right click
			openFileContextMenu(fileContextMenu, {x:e.clientX, y:e.clientY}, clickedFile)
		}
	})
}

let temporalFilenameInputValue = "";
let filenameRenameInputValue = "";


</script>

<link rel="shortcut icon" href={favicon} type="image/x-icon">
<main>
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
						<button class="element" on:click={() => elementClicked(content.path, true)}>
							<Icon src={IconDictionary[content.type]} className="icon {content.type} {USER_OS}"/>
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
						<Icon src={IconDictionary[content.type]} className="icon {content.type} {USER_OS}"/>
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
						<div style="background-image:url(data:image/png;base64,{content.preview});width:90px;height:90px;background-size:contain;background-repeat:no-repeat;background-position:center;{content.extension == ".svg" ? "background-color:white;" : ""}"></div>
					{:else}
						<Icon src={GetIconByType(content.iconClass)} className="icon {content.iconClass} {USER_OS}"/>
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
	<div class="breadcrumb">
		<div class="element">
			<HardDrive class="icon folderDisk"/>
			<div class="text">Disk one (C:)</div>
		</div>
		<ChevronRight class="icon"/>
		<div class="element">
			<Folder class="icon folder"/>
			<div class="text">Users</div>
		</div>
		<ChevronRight class="icon"/>
		<div class="element">
			<Folder class="icon folder"/>
			<div class="text">hugom</div>
		</div>
		<ChevronRight class="icon"/>
		<div class="element">
			<File class="icon folderDesktop"/>
			<div class="text">Desktop</div>
		</div>
		<ChevronRight class="icon"/>
		<div class="element">
			<File class="icon folder"/>
			<div class="text">My folder</div>
		</div>
	</div>

	{#if $previewProgress != "100" && $previewProgress != "100.00"}
		<div class="percent">Loading preview: {$previewProgress}%</div>
	{/if}

	<div class="right">
		<button class="logo" on:click={() => BrowserOpenURL("https://github.com/keelus/gyozora")}><img src={appicon} alt="Gyozora icon" class="appicon"/> <span class="appname">Gyozora</span> <span class="version">· {APP_VERSION}</span></button>
	</div>
</div>
<div class="modalParent" data-activeModal="" bind:this={modalParent}>
	<div class="modal newFile">
		<div class="top">
			<div class="title">Create a new file</div>
		</div>
		<div class="middle">
			<!-- <div class="message"></div> -->
			<input type="text" placeholder="Filename and extension..." bind:value={temporalFilenameInputValue}>
		</div>
		<div class="bottom">
			<button class="cancel">Cancel</button>
			<button class="confirm" disabled={temporalFilenameInputValue == ""}>Create</button>
		</div>
	</div>
	<div class="modal rename">
		<div class="top">
			<div class="title">Rename a file</div>
		</div>
		<div class="middle">
			<!-- <div class="message"></div> -->
			<input type="text" placeholder="New filename and extension..." bind:value={filenameRenameInputValue}>
		</div>
		<div class="bottom">
			<button class="cancel">Cancel</button>
			<button class="confirm" disabled={filenameRenameInputValue == ""}>Rename</button>
		</div>
	</div>
</div>
<!-- <img alt="Wails logo" id="logo" src="{logo}">
<div class="result" id="result">{resultText}</div>
<div class="input-box" id="input">
	<h1>This is a test! Value 👉"{name}"👈</h1>
	<input autocomplete="off" bind:value={name} class="input" id="name" type="text"/>
	<button class="btn" on:click={greet}>Greet</button>
</div> -->
</main>

<style>
</style>
	