<script>
	import appicon from './assets/icons/gyozora.svg'
	import { GetStartingPath, LoadPinnedFolders, LoadYourComputer, OpenFile } from '../wailsjs/go/main/App.js'
	import { ReadPath, RenderPreview } from '../wailsjs/go/main/App.js';
	import { Home, Laptop2, FolderDown, File, Image, Music, HardDrive, ArrowLeft, ArrowRight, FileImage, FileVideo2, FileAudio2, Folder, ChevronRight, FileArchive, FileTerminal, FileType, FileText, HelpCircleIcon, FileCode, FileJson, AppWindow, Menu } from 'lucide-svelte';
	import { BrowserOpenURL } from '../wailsjs/runtime/runtime'
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import AiFillFilePdf from "svelte-icons-pack/ai/AiFillFilePdf"; 

	

	console.log(appicon)

	let CURRENT_PATH = ""

	let contents = []
	let pinnedFolders = []
	let yourComputer = []
  
	document.addEventListener("DOMContentLoaded", () => {
	  FirstStart()
	})
  
	async function FirstStart() {
		CURRENT_PATH = await GetStartingPath()
		pinnedFolders = await LoadPinnedFolders()
		yourComputer = await LoadYourComputer()
		LoadFolder(CURRENT_PATH, false, false, true)
	}

	let backHistory = []
	let forwardHistory = []

	let goBackEnabled = true;
	let goForwardEnabled = true;

	let previewProgress = "100"
	let currentJob = -1

	let selectedFiles = []

	async function LoadFolder(newPath, goingBack, goingForward, ignorePathHistory) {
		console.log("Loading folder 📂 ...")
		// Check if we are able to open directory
		contents = []
		selectedFiles = []
		const directoryElements = await ReadPath(newPath)
		// if(error != null) ...
    	
    	if(!ignorePathHistory) {
        	if(goingBack && !goingForward) {
    			forwardHistory.push(CURRENT_PATH);
        	} else if (!goingBack && goingForward) {
        		backHistory.push(CURRENT_PATH);
        	} else if (!goingBack && !goingForward) {
        		backHistory.push(CURRENT_PATH);
    			forwardHistory = [];
        	}
    	}

    	goBackEnabled = backHistory.length > 0
    	goForwardEnabled = forwardHistory.length > 0
    	
    	CURRENT_PATH = newPath;

		const newElements = directoryElements.map((element) => ({
			...element,
		}))
		contents = newElements


		let previewTotalCount = directoryElements.filter(element => element.iconClass == "fileImage").length

		// let batchUnix = Math.floor(Date.now() / 1000)
		let batchUnix = Math.floor(Math.random() * 999_999_999)
		currentJob = batchUnix
		previewProgress = "0"

		if (previewTotalCount == 0) {
			console.log("NO PREVIEW NEEDED")
			previewProgress = "100"
		} else {
			let remaining = previewTotalCount
			for(let i = 0; i < directoryElements.length; i++ ){
				if(currentJob != batchUnix) {
					console.log("COMPLETLY CANCELLED 0")
					break
				}
				if(directoryElements[i].iconClass != "fileImage") continue;
				// console.log("Calling to render: '" + directoryElements[i].name + "'")
				remaining -= 1 

				let newPreview =  await RenderPreview(directoryElements[i],  batchUnix, remaining);
				previewProgress = ((previewTotalCount - remaining) * 100 / previewTotalCount).toFixed(2)

				if(currentJob != batchUnix) {
					console.log("COMPLETLY CANCELLED 1")
					break
				} 

				contents[i].preview = newPreview.preview
			}
		}


		if(currentJob == batchUnix) {
			console.log("Preview render finished")
			currentJob = -1
		}
    }

  function elementClicked(fpath, isfolder) {
	  if(isfolder){
		  return LoadFolder(fpath, false, false, false)
	  }
  
	  OpenFile(fpath)
  }
  
  function generateRandomHash(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let hash = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		hash += characters.charAt(randomIndex);
	}

	return hash;
	}

  function GetIconByType(ftype) {
	let icon = IconDictionary[ftype]
	if (ftype === undefined)
		return "file";

	return icon

  }

  // https://leshak.github.io/svelte-icons-pack/#/search/pdf

  
  import AiFillFolder from "svelte-icons-pack/ai/AiFillFolder";
  import AiOutlineDesktop from "svelte-icons-pack/ai/AiOutlineDesktop"; 
  import AiFillFileImage from "svelte-icons-pack/ai/AiFillFileImage";
  import AiFillFileZip from "svelte-icons-pack/ai/AiFillFileZip";

  import HiOutlineDocument from "svelte-icons-pack/hi/HiOutlineDocument";
  import HiSolidFolderDownload from "svelte-icons-pack/hi/HiSolidFolderDownload";

  import RiMediaMusic2Fill from "svelte-icons-pack/ri/RiMediaMusic2Fill";
  import RiMediaFilmFill from "svelte-icons-pack/ri/RiMediaFilmFill";
  import RiBusinessWindowFill from "svelte-icons-pack/ri/RiBusinessWindowFill";

  import BsFileEarmarkMusicFill from "svelte-icons-pack/bs/BsFileEarmarkMusicFill";
  import BsTerminalFill from "svelte-icons-pack/bs/BsTerminalFill";
  import BsFileEarmarkFontFill from "svelte-icons-pack/bs/BsFileEarmarkFontFill";
  import BsFileEarmarkCodeFill from "svelte-icons-pack/bs/BsFileEarmarkCodeFill";

  import FiHardDrive from "svelte-icons-pack/fi/FiHardDrive";

  import IoDocument from "svelte-icons-pack/io/IoDocument";
  
  import SiJson from "svelte-icons-pack/si/SiJson";
  
  const IconDictionary = {
		"folder":  AiFillFolder ,
		"folderDesktop": AiOutlineDesktop,
		"folderDownloads": HiSolidFolderDownload,
		"folderDocuments": HiOutlineDocument,
		"folderPictures": AiFillFileImage,
		"folderMusic": RiMediaMusic2Fill,
		"folderDisk": FiHardDrive,
  
		"file": IoDocument,
		"fileImage": AiFillFileImage,
		"fileAudio": BsFileEarmarkMusicFill,
		"fileVideo": RiMediaFilmFill,
		"fileCompressed": AiFillFileZip,
		"fileExecutable":RiBusinessWindowFill,
		"fileExecutableScript":BsTerminalFill,
		"fileFont":BsFileEarmarkFontFill,
		"fileCode":BsFileEarmarkCodeFill,
		"fileJson":SiJson,
		"filePdf":AiFillFilePdf,
  }
  
  document.addEventListener("keyup", (e) => {
	  if(e.key == "Enter") {
		  FirstStart()
			backHistory = []
			forwardHistory = []
			goBackEnabled = false
			goForwardEnabled = false
	  }
  })
  document.addEventListener("mousedown", (e) => {
	 if(e.button == 3) buttonGoBack()
	 else if(e.button == 4) buttonGoForward()
  })

  function buttonGoBack() {
	if(backHistory.length == 0) return console.log("✋ Can't go back")
	console.log("👈 going back")
	let newPath = backHistory.pop()

	LoadFolder(newPath, true, false, false)
  }
  
  function buttonGoForward() {
	if(forwardHistory.length == 0) return console.log("✋ Can't go forward")
	console.log("going forward 👉")
	let newPath = forwardHistory.pop()

	LoadFolder(newPath, false, true, false)
}

function addToSelected(ev, file) {
	if(ev.button != 0 && ev.button != 2) return;

	if(ev.button == 2) {
		if(selectedFiles.includes(file)) return; // If right clicked multiple, do nothing
		let newSelectedFiles = [file] // if right clicked one that is not selected, then we select this
		selectedFiles = newSelectedFiles
		return
	}

	if(ev.ctrlKey && !ev.shiftKey) {
		let newSelectedFiles = []
		if(selectedFiles.includes(file)){
			for(let i = 0; i < selectedFiles.length; i++) {
				if(selectedFiles[i] != file)
				newSelectedFiles.push(selectedFiles[i])
			}
		}
		else {
			newSelectedFiles = selectedFiles
			newSelectedFiles.push(file)
		}
		selectedFiles = newSelectedFiles
		return
	}

	if (ev.shiftKey) {
		if(selectedFiles.length == 0){ // No item has been selected previously 
			let newSelectedFiles = []
			for(let i = 0; i < contents.length; i++) {
				newSelectedFiles.push(contents[i])
				if(contents[i] == file) // Select from file 0 to selected with mayus
					break;
			}
			selectedFiles = newSelectedFiles
			return
		} else { 
			// Else if one or more files has been selected, we will select from the last one to the current selected
			let firstSelectedIndex = contents.indexOf(selectedFiles[0])
			let lastSelectedIndex = contents.indexOf(selectedFiles[selectedFiles.length-1])
			let selectedIndex = contents.indexOf(file)

			// Check if the newly selected is the same as the last selected. If is, then do nothing.
			if(selectedIndex == lastSelectedIndex) return;

			// If is not, check if the newly selected is before the first selected element, if is, then select from this one to that.
			if(selectedIndex < firstSelectedIndex) {
				let newSelectedFiles = []
				for(let i = selectedIndex; i <= firstSelectedIndex; i++) {
					newSelectedFiles.push(contents[i])
				}
				selectedFiles = newSelectedFiles
				return
			}

			// If is not, check if is one of the currently selected ones. If is, then we select from the first originally selected
			// to this one, removing the rest.
			if(selectedFiles.includes(file)) {
				let newSelectedFiles = []
				for(let i = firstSelectedIndex; i <= selectedIndex; i++) {
					newSelectedFiles.push(contents[i])
				}
				selectedFiles = newSelectedFiles
				return
			}
			
			// If is not, then we select from the last of selected to this file.
			let newSelectedFiles = selectedFiles
			for(let i = lastSelectedIndex + 1; i <= selectedIndex; i++) {
				newSelectedFiles.push(contents[i])
			}
			selectedFiles = newSelectedFiles
			return
		}
	}

	selectedFiles = [file]
}

document.addEventListener("keyup", (e) => {
	if(e.key == "Escape") selectedFiles = []
})

let fileBrowser;
$: if (fileBrowser) {
	fileBrowser.addEventListener("mouseup", (e) => {
		if(e.button == 0){ // Left click
			closeFileContextMenu()
			let clickedFile = e.target.closest("button.file") !== null
			if(clickedFile) return;
			selectedFiles = []
		} else if (e.button == 2) { // Right click
			let clickedFile = e.target.closest("button.file")
			openFileContextMenu({x:e.clientX, y:e.clientY}, clickedFile)
		}
	})
}


let fileContextMenuOptions = {
	add:{show:true,disabled:false},
	open:{show:true,disabled:false},
	cut:{show:true,disabled:false},
	copy:{show:true,disabled:false},
	paste:{show:true,disabled:false},
	rename:{show:true,disabled:false},
	delete:{show:true,disabled:false},
	properties:{show:true,disabled:false}
}
let fileContextMenu;
$: if (fileContextMenu) {
	// fileBrowser.addEventListener("click", (e) => {
	// 	let clickedFile = e.target.closest("button.file") !== null
	// 	if(clickedFile) return;
	// 	selectedFiles = []
	// })
}
async function openFileContextMenu(coordinates, file) {
	fileContextMenu.classList.add("opened")

	if(file == null) { // Right clicked in the body
		await setContextMenuOptions("none")
		selectedFiles = []
	} else {
		if(selectedFiles.length <= 1){
			await setContextMenuOptions("single")
		} else {
			await setContextMenuOptions("multiple")
		}
	}
	
	const minMarginX = 20;
	const minMarginY = 40;

	let windowW = window.innerWidth;
	let windowH = window.innerHeight;

	let dX = coordinates.x || 0;
	let dY = coordinates.y || 0;

	let offX = dX + fileContextMenu.clientWidth + minMarginX - windowW;
	let offY = dY + fileContextMenu.clientHeight + minMarginY - windowH;

	let finalX = offX > 0 ? windowW - fileContextMenu.clientWidth - minMarginX : dX;
	let finalY = offY > 0 ? windowH - fileContextMenu.clientHeight - minMarginY : dY;

	fileContextMenu.style.left = `${finalX}px`
	fileContextMenu.style.top = `${finalY}px`

}
function closeFileContextMenu() {
	fileContextMenu.classList.remove("opened")
}

async function setContextMenuOptions(mode) {
	fileContextMenuOptions = {	
		add:{show:true,disabled:false},
		open:{show:true,disabled:false},
		cut:{show:true,disabled:false},
		copy:{show:true,disabled:false},
		paste:{show:true,disabled:false},
		rename:{show:true,disabled:false},
		delete:{show:true,disabled:false},
		properties:{show:true,disabled:false}
	}

	if(mode == "") return;

	if(mode == "none") {
		fileContextMenuOptions.open.show = false;
		fileContextMenuOptions.cut.show = false;
		fileContextMenuOptions.copy.show = false;
		fileContextMenuOptions.paste.disabled = true; // Check clipboard
		fileContextMenuOptions.rename.show = false;
		fileContextMenuOptions.delete.show = false;
		return
	}

	if(mode == "single") {
		fileContextMenuOptions.add.show = false;
		fileContextMenuOptions.paste.disabled = true; // Check clipboard
		return
	}

	if(mode == "multiple") {
		fileContextMenuOptions.add.show = false;
		fileContextMenuOptions.open.show = false;
		fileContextMenuOptions.paste.disabled = true; // Check clipboard
		fileContextMenuOptions.rename.show = false;
		fileContextMenuOptions.properties.show = false;
	}
	
}


import IoAddCircleSharp from "svelte-icons-pack/io/IoAddCircleSharp";
import FiExternalLink from "svelte-icons-pack/fi/FiExternalLink";
import BsScissors from "svelte-icons-pack/bs/BsScissors";
import FaCopy from "svelte-icons-pack/fa/FaCopy";
import FaSolidPaste from "svelte-icons-pack/fa/FaSolidPaste";
import BsInputCursorText from "svelte-icons-pack/bs/BsInputCursorText";
import FiTrash from "svelte-icons-pack/fi/FiTrash";
import RiDocumentFileSearchLine from "svelte-icons-pack/ri/RiDocumentFileSearchLine";

document.addEventListener('contextmenu', event => event.preventDefault());

  </script>
  
  <main>
	  <div class="toolbar"></div>
	  <div class="pathbar">
		  <button class="backButton" disabled={!goBackEnabled} on:click={buttonGoBack}><ArrowLeft class="icon"/></button>
		  <button class="forwardButton" disabled={!goForwardEnabled} on:click={buttonGoForward}><ArrowRight class="icon" /></button>
		  <input class="path" placeholder="Current path..." value={CURRENT_PATH} disabled/>
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
								<Icon src={IconDictionary[content.type]} className="icon {content.type}"/>
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
							<Icon src={IconDictionary[content.type]} className="icon {content.type}"/>
							<div class="text">{content.name}</div>
						</button>
					{/each}
				  </div>
			  </div>
		  </div>

		<div class="fileBrowser" bind:this={fileBrowser}>
			<div class="fileContextMenu" bind:this={fileContextMenu}>
				<button class:disabled={fileContextMenuOptions.add.disabled} class:hide={!fileContextMenuOptions.add.show} class="element">
					<Icon src={IoAddCircleSharp} className="icon add" />
					<span class="text">Add</span>
				</button>
				<button class:disabled={fileContextMenuOptions.open.disabled} class:hide={!fileContextMenuOptions.open.show} class="element">
					<Icon src={FiExternalLink} className="icon open" />
					<span class="text">Open</span>
				</button>
				<div class:hide={!fileContextMenuOptions.add.show && !fileContextMenuOptions.open.show} class="divider"></div>
				<button class:disabled={fileContextMenuOptions.cut.disabled} class:hide={!fileContextMenuOptions.cut.show} class="element">
					<Icon src={BsScissors} className="icon cut" />
					<span class="text">Cut</span>
				</button>
				<button class:disabled={fileContextMenuOptions.copy.disabled} class:hide={!fileContextMenuOptions.copy.show} class="element">
					<Icon src={FaCopy} className="icon copy" />
					<span class="text">Copy</span>
				</button>
				<button class:disabled={fileContextMenuOptions.paste.disabled} class:hide={!fileContextMenuOptions.paste.show} class="element"> <!-- Allow only if clicked on body, not on file -->
					<Icon src={FaSolidPaste} className="icon paste" />
					<span class="text">Paste</span> 
				</button>
				<div class:hide={!fileContextMenuOptions.rename.show && !fileContextMenuOptions.delete.show} class="divider"></div>
				<button class:disabled={fileContextMenuOptions.rename.disabled} class:hide={!fileContextMenuOptions.rename.show} class="element">
					<Icon src={BsInputCursorText} className="icon rename" />
					<span class="text">Rename</span>
				</button>
				<button class:disabled={fileContextMenuOptions.delete.disabled} class:hide={!fileContextMenuOptions.delete.show} class="element">
					<Icon src={FiTrash} className="icon delete" />
					<span class="text">Delete</span>
				</button>
				<div class:hide={!fileContextMenuOptions.properties.show} class="divider"></div>
				<button class:disabled={fileContextMenuOptions.properties.disabled} class:hide={!fileContextMenuOptions.properties.show} class="element">
					<Icon src={RiDocumentFileSearchLine} className="icon properties" />
					<span class="text">Properties</span>
				</button>
			</div>
			{#if contents.length == 0}
				<div class="emptyMessage">No files found here 👎</div>
			{/if}
			{#each contents as content}
				{#if content != undefined}
					<button class="file {selectedFiles.includes(content) ? "selected" : ""}" title="{content.filename}" on:dblclick={() => elementClicked(content.pathfull, content.isFolder)} on:mouseup={e => addToSelected(e, content)}>
						{#if content.iconClass == "fileImage" && content.preview != ""}
							<div style="background-image:url(data:image/png;base64,{content.preview});width:90px;height:90px;background-size:contain;background-repeat:no-repeat;background-position:center;" ></div>
						{:else}
							<Icon src={GetIconByType(content.iconClass)} className="icon {content.iconClass}"/>
						{/if}
						<div class="text">{content ? content.filename : "Error"}</div>
					</button>
				{/if}
			{/each}
		  </div>
	  </div>
	  <div class="loader">
		<div class="progress" style="--loadProgress:{previewProgress == "100" || previewProgress == "100.00" ? "0" : previewProgress}%;"></div>
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
				<File class="icon folderDocuments"/>
				<div class="text">Documents</div>
			</div>
		</div>

		{#if previewProgress != "100" && previewProgress != "100.00"}
			<div class="percent">Loading preview: {previewProgress}%</div>
		{/if}

		<div class="right">
			<button class="logo" on:click={() => BrowserOpenURL("https://github.com/keelus/gyozora")}><img src={appicon} alt="Gyozora icon" class="appicon"/> <span class="appname">Gyozora</span> <span class="version">· {APP_VERSION}</span></button>
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
  