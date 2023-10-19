<script>
	import logo from './assets/images/logo-universal.png'
	import { GetStartingPath, LoadPinnedFolders, LoadYourComputer, OpenFile } from '../wailsjs/go/main/App.js'
	import { ReadPath, RenderPreview } from '../wailsjs/go/main/App.js';
	import { Home, Laptop2, FolderDown, File, Image, Music, HardDrive, ArrowLeft, ArrowRight, FileImage, FileVideo2, FileAudio2, Folder, ChevronRight, FileArchive, FileTerminal, FileType, FileText, HelpCircleIcon, FileCode, FileJson, AppWindow } from 'lucide-svelte';
	import { BrowserOpenURL } from '../wailsjs/runtime/runtime'
  import { element } from 'svelte/internal';
  import Icon from 'svelte-icons-pack/Icon.svelte';
  import AiFillFilePdf from "svelte-icons-pack/ai/AiFillFilePdf"; 

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
				console.log("Calling to render: '" + directoryElements[i].name + "'")
				remaining -= 1 

				let newPreview =  await RenderPreview(directoryElements[i],  batchUnix, remaining);
				previewProgress = ((previewTotalCount - remaining) * 100 / previewTotalCount).toFixed(2)

				console.log(newPreview)

				if(currentJob != batchUnix) {
					console.log("COMPLETLY CANCELLED 1")
					break
				} 

				contents[i].preview = newPreview.preview
			}
		}


		if(currentJob == batchUnix) {
			console.log("FINISHED")
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
	console.log(ev.shiftKey)
	if(ev.ctrlKey) {
		let currentSelectedFiles = selectedFiles
		currentSelectedFiles.push(file)
		selectedFiles = currentSelectedFiles
	} else if (ev.shiftKey) {
		if(selectedFiles.length == 0){ // No item has been selected previously 
			let newSelectedFiles = []
			for(let i = 0; i < contents.length; i++) {
				newSelectedFiles.push(contents[i])
				if(contents[i] == file) // Select from file 0 to selected with mayus
					break;
			}
			selectedFiles = newSelectedFiles
		} else { // Else if one or more files has been selected, we will select from the last one to the current selected
			// HERE DO:
			// Check if the newly selected is the same as the last selected. If is, then do nothing.
			// If is not, check if the newly selected is before the first selected element, if is, then select from this one to that.
			// If is not, check if is one of the currently selected ones. If is, then we select from the first originally selected
			// to this one, removing the rest.
			// If is not, then we select from the last of selected to this file.
			
			
			let newSelectedFiles = selectedFiles
			let isAfter = false
			for(let i = 0; i < contents.length; i++) {
				if(contents[i] == selectedFiles[selectedFiles.length-1])
					isAfter = true
				if(!isAfter) continue

				newSelectedFiles.push(contents[i])
				if(contents[i] == file) // Select from file 0 to selected with mayus
					break;
			}
			selectedFiles = newSelectedFiles

		}

		// TODO: Handle if previous one is selected


	} else {
		selectedFiles = [file]
	}
}

document.addEventListener("keyup", (e) => {
	if(e.key == "Escape") selectedFiles = []
})
  
  
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
		  <div class="fileBrowser">
				{#if contents.length == 0}
					<div class="emptyMessage">No files found here 👎</div>
				{/if}
				{#each contents as content}
					{#if content != undefined}
						<button class="file {selectedFiles.includes(content) ? "selected" : ""}" title="{content.filename}" on:dblclick={() => elementClicked(content.pathfull, content.isFolder)} on:click={e => addToSelected(e, content)}>
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
			<div class="previewProgress">
				<input type="range" name="" id="" max="100" min="0" value={previewProgress} />
				<div class="percent">Loading render: {previewProgress}%</div>
			</div>
		{/if}

		<div class="right">
			<button class="logo" on:click={() => BrowserOpenURL("https://github.com/keelus/gyozora")}>Gyozora <span>· {APP_VERSION}</span></button>
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
  