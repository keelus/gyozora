<script lang="ts">
// Wails/backend functions & models
import { GetStartingPath, LoadPinnedFolders, LoadYourComputer, GetUserOS, ReadPath } from '../wailsjs/go/main/App.js'
import { BrowserOpenURL } from '../wailsjs/runtime/runtime'
import type { models } from 'wailsjs/go/models.js';
// Gyozora icons
import favicon from "./assets/icons/favicon.ico"
import appicon from './assets/icons/gyozora.svg'

// UI Icons
import Icon from '@iconify/svelte';
// Gyozora browser, icons & logic
import { activeJobs, contents, selectedFiles, fileContextMenuOptions, CURRENT_PATH, goBackEnabled, goForwardEnabled, previewProgress, USER_OS, CURRENT_PATH_BREADCRUMB_ELEMENTS, settings, languageDictionary, pinnedFolders, searchInput, searchInputText } from "./utils/store";
import { LoadFolder, buttonGoBack, buttonGoForward, elementClicked, addToSelected } from "./utils/pathManager.js";
import { IconDictionary, GetIconByType } from "./utils/icons";
import { closeFileContextMenu, openFileContextMenu, doAction } from "./utils/contextMenu";

import { Toaster } from 'svelte-french-toast';

import zoomOutLine from '@iconify/icons-ri/zoom-out-line';
import zoomInLine from '@iconify/icons-ri/zoom-in-line';

let yourComputer : models.LeftBarElement[] = []

let fileBrowser : HTMLDivElement;
let fileContextMenu : HTMLDivElement;
let modalParent : HTMLDivElement;

let fileButton : HTMLButtonElement;

import { CopyToClipboard, PasteFromClipboard } from './utils/clipboard';

import ActiveJobs from './components/ActiveJobs.svelte'
import { Plural, renderBytes } from './utils/utils';

import { GetSetting, LoadSettings, MAX_ZOOM, MIN_ZOOM, SetSetting, ZoomIn, ZoomOut } from './utils/settings';
import Settings from './components/Settings.svelte';
import { GetWord, LoadDictionary } from './utils/languages';
import { onMount } from 'svelte';




onMount(FirstStart)

async function FirstStart() {
	AddListeners()
	USER_OS.set(await GetUserOS());
	$CURRENT_PATH = await GetStartingPath()
	pinnedFolders.set(await LoadPinnedFolders())
	yourComputer = await LoadYourComputer()
	LoadSettings()
	LoadFolder($CURRENT_PATH, false, false, true)

	LoadDictionary()
}

function AddListeners() {
	// document.addEventListener('contextmenu', e => e.preventDefault());
	document.addEventListener("mousedown", e => {
		switch(e.button){
			case 3:
				buttonGoBack()
				break;
			case 4:
				buttonGoForward()
				break;
		}
	})
	document.addEventListener("keydown", e => {
		let activeModal = null;
		switch(e.key) {
			case "Enter":
				activeModal = modalParent?.getAttribute("data-activeModal")
				if(activeModal == "") {
					let keyTarget : HTMLElement  = e.target as HTMLElement;
					if(keyTarget.classList.contains("file")){
						doAction("open")
					}
				} else {
					const confirmButton = modalParent.querySelector(`.${activeModal} > .bottom > button.confirm`) as HTMLButtonElement
					if(confirmButton) confirmButton.click()
				}
				break;
			case "Escape":
				activeModal = modalParent?.getAttribute("data-activeModal")
				if(activeModal == "")
					$selectedFiles = []
				else {
					const cancelButton = modalParent.querySelector(`.${activeModal} > .bottom > button.cancel`) as HTMLButtonElement
					if(cancelButton) cancelButton.click()
				}
				break;
			case "Delete":
					doAction("delete");
				break;
			case "Backspace":
				if(e.metaKey)
					doAction("delete");
				break;
			case "F2":
				doAction("rename")
				break;
			case "N":
			case "n":
				if(e.shiftKey && (e.ctrlKey || e.metaKey)){ // For folder by default creating
					e.preventDefault()
					doAction("add")
				}
				break;
		}

		const targetElement = e.target as HTMLElement;
		if(targetElement.tagName != "INPUT" && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey)
			if((e.which >= 65 && e.which <= 90) || (e.which >= 48 && e.which <= 57) || e.which == 192) { // a-z, 0-9, ñ
				const letter = e.key.toLowerCase();


				let alreadySelectedFile = null;
				if($selectedFiles.length == 1) {
					if($selectedFiles[0].filename[0].toLowerCase() == letter) {
						alreadySelectedFile = $selectedFiles[0]
					}
				}

				let itemToSelect = null;
				if(alreadySelectedFile){
					const filesStartingThatLetter = $contents.filter(file => {if (file.filename[0].toLowerCase() == letter) return file})
					const alreadySelectedFileIndex = filesStartingThatLetter.indexOf(alreadySelectedFile)

					let targetIndex = alreadySelectedFileIndex + 1;
					if(alreadySelectedFileIndex == filesStartingThatLetter.length-1) targetIndex = 0;

					itemToSelect = filesStartingThatLetter[targetIndex];
				} else {
					for(const file of $contents) {
						console.log("iteracion");

						if(file.filename[0].toLowerCase() == letter) {
							$selectedFiles.push(file);
							itemToSelect = file;
							break;
						}
					}
				}

				if(itemToSelect) {
					$selectedFiles = [itemToSelect]

					const fileElement = itemToSelect.divElement as HTMLElement
					fileElement.scrollIntoView({behavior:'smooth'})
				}
				
			}
	});


	document.addEventListener("mousewheel", event => {
		const e : WheelEvent = event as WheelEvent

		if(!e.ctrlKey) return;
		const goingUp = e.deltaY === -100;
		
		const zoomIncrement = 5;
		const maxZoom = 150;
		const minZoom = 50;
		const curZoom = parseInt(GetSetting("zoomLevel"))

		let tgtZoom = 100;
		if(goingUp){
			if(curZoom + zoomIncrement > maxZoom) tgtZoom = maxZoom
			else tgtZoom = curZoom + zoomIncrement
		} else {
			if(curZoom - zoomIncrement < minZoom) tgtZoom = minZoom
			else tgtZoom = curZoom - zoomIncrement
		}

		SetSetting("zoomLevel", tgtZoom.toString())
	})
	document.addEventListener("copy", e => {
		if(e.target != document.body) return;
		CopyToClipboard();
	})
	document.addEventListener("paste", e => {
		if(e.target != document.body) return;
		PasteFromClipboard();
	})

	document.addEventListener("mouseup", (e : MouseEvent) => {
		let clickedTarget = e.target as HTMLElement;
		if(clickedTarget.closest(".fileBrowser") === null) {
			return closeFileContextMenu(fileContextMenu)
		}; // Prevent context menu outside the file browser
		if(!clickedTarget) return;
		let clickedFile = clickedTarget.closest("button.file")
		let clickedCtxMenu = clickedTarget.closest(".fileContextMenu")

		if(clickedFile) clickedTarget.focus();
		
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



$: lang = $settings && $languageDictionary

let temporalFilenameInputValue = "";
let filenameRenameInputValue = "";

let activeJobsOpened = false;

let settingsWindow : Settings;


let pathInput : HTMLInputElement;
let pathIsFocus : boolean = false;
function checkPathEnterkey(e : KeyboardEvent) {
	if(e.key == "Enter") {
		const newPath = pathInput.value;
		pathInput.blur()
		LoadFolder(newPath, false, false, false);
	}
}
function pathOnFocus(e : FocusEvent) {
	pathInput.value = $CURRENT_PATH;
	pathIsFocus = true;
}
function pathOnBlur(e : FocusEvent) {
	pathInput.value = $CURRENT_PATH;
	pathIsFocus = false;
}

function pathGoRefreshAction() {
	if(pathIsFocus){
		const newPath = pathInput.value;
		pathInput.blur()
		LoadFolder(newPath, false, false, false);
	} else {
		LoadFolder($CURRENT_PATH, false, false, true);
	}
}

</script>

<link rel="shortcut icon" href={favicon} type="image/x-icon">
<main data-user-os={$USER_OS} class="{$settings && GetSetting("theme")}" style="--lang:'{$settings && GetSetting("language")}';">
	<div class="appTitleBar" style="widows: 1;"></div>
	<Toaster containerStyle="margin-bottom:10px;"/>
	<div class="toolbar"></div>
	<div class="pathbar">
		<button class="backButton" disabled={!$goBackEnabled} on:click={buttonGoBack}><Icon icon={IconDictionary["uiArrowLeft"]} class="icon"/></button>
		<button class="forwardButton" disabled={!$goForwardEnabled} on:click={buttonGoForward}><Icon icon={IconDictionary["uiArrowRight"]} class="icon"/></button>
		<div class="inputWithButton">
			<input class="path" placeholder="Current path..." value={$CURRENT_PATH} on:keydown={e => checkPathEnterkey(e)} bind:this={pathInput} on:blur={e => pathOnBlur(e)} on:focus={e => pathOnFocus(e)}/>
			<button class="pathGoRefresh" on:mousedown={pathGoRefreshAction}>
				{#if pathIsFocus}
					<Icon icon={IconDictionary["uiArrowRight"]} class="icon"/>
				{:else}
					<Icon icon={IconDictionary["uiRefresh"]} class="icon"/>
				{/if}
			</button>
		</div>
		<input class="search" placeholder="{lang && GetWord("searchPlaceholder")}" type="text" bind:value={$searchInputText} bind:this={$searchInput} />
	</div>
	<div class="mainContent">
		<div class="navPane">
			<div class="section">
				<div class="title"><span class="text">{lang && GetWord("pinnedFolders")}</span></div>
				<div class="elements">
				{#if $pinnedFolders.length == 0}
					<div class="emptyMessage">{lang && GetWord("pinnedFoldersEmpty")} 👎</div>
				{/if}
					{#each $pinnedFolders as content}
							<button class="element {$CURRENT_PATH == content.pathfull ? "active" : ""}" on:click={() => elementClicked(content.pathfull, true)}>
								<Icon icon={IconDictionary[content.iconClass]} class="icon {content.iconClass} {$USER_OS}"/>
								<div class="text">{content.filename}</div>
							</button>
					{/each}
				</div>
			</div>
			<div class="section">
				<div class="title"><span class="text">{lang && GetWord("yourComputer")}</span></div>
				<div class="elements">
				{#if yourComputer.length == 0}
					<div class="emptyMessage">{lang && GetWord("yourComputerEmpty")} 👎</div>
				{/if}
				{#each yourComputer as content}
					<button class="element {$CURRENT_PATH == content.path ? "active" : ""}" on:click={() => elementClicked(content.path, true)}>
						<Icon icon={IconDictionary[content.type]} class="icon {content.type} {$USER_OS}"/>
						<div class="text">{content.name}</div>
					</button>
				{/each}
				</div>
			</div>
		</div>

	<div class="fileBrowser" bind:this={fileBrowser}>
		<div class="fileContextMenu" bind:this={fileContextMenu}>
			<button class:disabled={$fileContextMenuOptions.add.disabled} class:hide={!$fileContextMenuOptions.add.show} class="ctxMenuButton element" on:click={() => doAction("add")}>
				<Icon icon={IconDictionary.ctxMenuAdd} class="icon add" />
				<span class="text">{lang && GetWord("ctxAdd")}</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.open.disabled} class:hide={!$fileContextMenuOptions.open.show} class="ctxMenuButton element"on:click={() => doAction("open")}>
				<Icon icon={IconDictionary.ctxMenuOpen} class="icon open" />
				<span class="text">{lang && GetWord("ctxOpen")}</span>
			</button>
			<div class:hide={!$fileContextMenuOptions.add.show && !$fileContextMenuOptions.open.show} class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.copy.disabled} class:hide={!$fileContextMenuOptions.copy.show} class="ctxMenuButton element"on:click={() => doAction("copy")}>
				<Icon icon={IconDictionary.ctxMenuCopy} class="icon copy" />
				<span class="text">{lang && GetWord("ctxCopy")}</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.paste.disabled} class:hide={!$fileContextMenuOptions.paste.show} class="ctxMenuButton element"on:click={() => doAction("paste")}> <!-- Allow only if clicked on body, not on file -->
				<Icon icon={IconDictionary.ctxMenuPaste} class="icon paste" />
				<span class="text">{lang && GetWord("ctxPaste")}</span> 
			</button>
			<div class:hide={!$fileContextMenuOptions.rename.show && !$fileContextMenuOptions.delete.show} class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.rename.disabled} class:hide={!$fileContextMenuOptions.rename.show} class="ctxMenuButton element"on:click={() => doAction("rename")}>
				<Icon icon={IconDictionary.ctxMenuRename} class="icon rename" />
				<span class="text">{lang && GetWord("ctxRename")}</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.delete.disabled} class:hide={!$fileContextMenuOptions.delete.show} class="ctxMenuButton element"on:click={() => doAction("delete")}>
				<Icon icon={IconDictionary.ctxMenuDelete} class="icon delete" />
				<span class="text">{lang && GetWord("ctxDelete")}</span>
			</button>
			<div class:hide={!$fileContextMenuOptions.addToPinned.show && !$fileContextMenuOptions.removeFromPinned.show } class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.addToPinned.disabled} class:hide={!$fileContextMenuOptions.addToPinned.show} class="ctxMenuButton element"on:click={() => doAction("togglePinned")}>
				<Icon icon={IconDictionary.ctxMenuAddToPinned} class="icon addToPinned" />
				<span class="text">{lang && GetWord("ctxAddToPinned")}</span>
			</button>
			<button class:disabled={$fileContextMenuOptions.removeFromPinned.disabled} class:hide={!$fileContextMenuOptions.removeFromPinned.show} class="ctxMenuButton element"on:click={() => doAction("togglePinned")}>
				<Icon icon={IconDictionary.ctxMenuRemoveFromPinned} class="icon removeFromPinned" />
				<span class="text">{lang && GetWord("ctxRemoveFromPinned")}</span>
			</button>
			<div class:hide={!$fileContextMenuOptions.properties.show} class="divider"></div>
			<button class:disabled={$fileContextMenuOptions.properties.disabled} class:hide={!$fileContextMenuOptions.properties.show} class="ctxMenuButton element"on:click={() => doAction("properties")}>
				<Icon icon={IconDictionary.ctxMenuProperties} class="icon properties" />
				<span class="text">{lang && GetWord("ctxProperties")}</span>
			</button>
		</div>
		{#each $contents as content}
			{#if content != undefined}
				{#if content.filename.toLowerCase().includes($searchInputText.toLowerCase())}
					{#if !content.isHidden || (content.isHidden && $settings && GetSetting("showHiddenFiles") === "true") }
						<button bind:this={content.divElement} class="file {content.isHidden ? "hidden" : ""} {$selectedFiles.includes(content) ? "selected" : ""}" title="{lang && GetWord("hoverName")}{content.filename}&#013;{lang && GetWord("hoverSize")}{renderBytes(content.size)}" on:dblclick={() => elementClicked(content.pathfull, content.isFolder)} on:mouseup={e => addToSelected(e, content)} style="--zoom:{$settings && GetSetting("zoomLevel")}">
							{#if content.iconClass == "fileImage" && content.preview != "" && $settings && GetSetting("useThumbnails") === "true"}
								<div class="imagePreview" style="background-image:url(data:image/png;base64,{content.preview});{content.extension == ".svg" ? "background-color:white;" : ""}"></div>
							{:else}
								<div class="iconOuter">
									{#if content.iconClass.startsWith("file_")}
										<Icon icon={GetIconByType("file_")} class="icon file_ {$USER_OS}"/>
									{/if}
									<Icon icon={GetIconByType(content.iconClass)} class="icon {content.iconClass} {content.iconClass.startsWith("file_") ? "file_icon" : ""} {$USER_OS}"/>
								</div>
							{/if}
							<div class="text">{content.name}{$settings && GetSetting("showExtensions") === "true" ? content.extension : ""}
							</div>
						</button>
					{/if}
				{/if}
			{/if}
		{/each}
		{#if $contents && ($contents.length == 0 || fileBrowser.querySelectorAll(".file").length == 0)}
			<div class="emptyMessage">{lang && GetWord("fileBrowserEmpty")} 👎</div>
		{/if}
		</div>
	</div>
	<div class="loader">
		<div class="progress" style="--loadProgress:{$previewProgress == "100" || $previewProgress == "100.00" ? "0" : $previewProgress}%;"></div>
	</div>
<div class="bottom">
	<div class="breadcrumbs">
		{#if $settings && GetSetting("showBreadcrumbs") === "true"}
			{#each $CURRENT_PATH_BREADCRUMB_ELEMENTS as breadcrumb}
				<button class="breadcrumb" on:click={() => elementClicked(breadcrumb.pathfull, breadcrumb.isFolder)}>
					<Icon icon={GetIconByType(breadcrumb.iconClass)} class="icon {breadcrumb.iconClass} {$USER_OS}"/>
					<div class="text">{breadcrumb.filename}</div>
				</button>
				{#if $CURRENT_PATH_BREADCRUMB_ELEMENTS[$CURRENT_PATH_BREADCRUMB_ELEMENTS.length - 1] !== breadcrumb}
					<Icon icon={IconDictionary["uiArrowRightS"]} class="icon "/>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- {#if $previewProgress != "100" && $previewProgress != "100.00"}
		<div class="percent">Loading preview: {$previewProgress}%</div>
	{/if} -->
	<div class="vDivider"></div>
	<div class="zoom">
		<button class="zoomOut" on:click={ZoomOut} disabled={$settings && parseInt(GetSetting("zoomLevel")) == MIN_ZOOM}><Icon icon={zoomOutLine} /></button>
		<div class="zoomLevel">{$settings && GetSetting("zoomLevel")}%</div>
		<button class="zoomIn" on:click={ZoomIn} disabled={$settings && parseInt(GetSetting("zoomLevel")) == MAX_ZOOM}><Icon icon={zoomInLine} /></button>
	</div>
	<div class="vDivider"></div>
	<div class="activeJobsAmount"><!-- Adapted from https://github.com/timolins/react-hot-toast -->
		<button class="activeJobsButton" on:click={() => activeJobsOpened = !activeJobsOpened}>
			{#if Object.keys($activeJobs).length > 0}<div class="endlessLoader"></div>{/if}
			<div class="text">
				{lang && Object.keys($activeJobs).length + Plural(Object.keys($activeJobs).length, " " + GetWord("jobsBtn"))}
			</div>
		</button>
		<ActiveJobs opened={activeJobsOpened}/>
	</div>
	<div class="vDivider"></div>
	<div class="right">
		<button class="logo" on:click={() => BrowserOpenURL("https://github.com/keelus/gyozora")}><img src={appicon} alt="Gyozora icon" class="appicon"/> <span class="appname">Gyozora</span> <span class="version">· {APP_VERSION}</span></button>
	</div>
	<div class="vDivider"></div>
	<button class="openSettingsButton" on:click={() => settingsWindow.OpenSettings()}>
		<Icon icon={IconDictionary["uiSettingsGear"]} class="icon "/>
	</button>
</div>
<Settings bind:this={settingsWindow}/>
<div class="modalParent" data-activeModal="" bind:this={modalParent}>
</div>
</main>