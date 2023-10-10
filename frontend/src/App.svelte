<script>
	import logo from './assets/images/logo-universal.png'
	import { GetStartingPath, LoadPinnedFolders, LoadYourComputer, OpenFile } from '../wailsjs/go/main/App.js'
	import { ReadPath, RenderPreviews } from '../wailsjs/go/main/App.js';
	import { Home, Laptop2, FolderDown, File, Image, Music, HardDrive, ArrowLeft, ArrowRight, FileImage, FileVideo2, FileAudio2, Folder, ChevronRight, FileArchive, FileTerminal, FileType, FileText, HelpCircleIcon, FileCode, FileJson, AppWindow } from 'lucide-svelte';
	import { BrowserOpenURL } from '../wailsjs/runtime/runtime'


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

	async function LoadFolder(newPath, goingBack, goingForward, ignorePathHistory) {
		console.log("Loading folder 📂 ...")
		// Check if we are able to open directory
		contents = []
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

		let previousPath = CURRENT_PATH // Path when job started
		let contentsWithPreviews =  await RenderPreviews(directoryElements,  Math.floor(Date.now() / 1000))
		if (previousPath == CURRENT_PATH)
			contents = contentsWithPreviews
		else console.log("👍 folder changed, ignoring render.")

    }

  function elementClicked(fpath, isfolder) {
	  if(isfolder){
		  return LoadFolder(fpath, false, false, false)
	  }
  
	  OpenFile(fpath)
  }
  

  function GetIconByType(ftype) {
	let icon = IconDictionary[ftype]
	if (ftype === undefined)
		return "file";

	return icon

  }
  const IconDictionary = {
		"folder": Folder,
		"folderDesktop": Laptop2,
		"folderDownloads": FolderDown,
		"folderDocuments": File,
		"folderPictures": Image,
		"folderMusic": Music,
		"folderDisk": HardDrive,
  
		"file": File,
		"fileImage": FileImage,
		"fileAudio": FileAudio2,
		"fileVideo": FileVideo2,
		"fileCompressed": FileArchive,
		"fileExecutable":AppWindow,
		"fileExecutableScript":FileTerminal,
		"fileFont":FileType,
		"fileCode":FileCode,
		"fileJson":FileJson,
		"filePdf":FileText,
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
							  <svelte:component this={IconDictionary[content.type]} class="icon {content.type}"/>
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
							<svelte:component this={IconDictionary[content.type]} class="icon {content.type}"/>
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
				  <button class="file" title="{content.filename}" on:click={() => elementClicked(content.pathfull, content.isFolder)}>
					{#if content.iconClass == "fileImage" && content.preview != ""}
						<div style="background-image:url(data:image/png;base64,{content.preview});width:90px;height:90px;background-size:contain;background-repeat:no-repeat;background-position:center;" ></div>
					{:else}
						<svelte:component this={GetIconByType(content.iconClass)} class="icon {content.iconClass}"/>
					{/if}
					  <div class="text">{content.filename}</div>
				  </button>
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
				<div class="text">username</div>
			</div>
			<ChevronRight class="icon"/>
			<div class="element">
				<Laptop2 class="icon folderDesktop"/>
				<div class="text">Desktop</div>
			</div>
		</div>
		<div class="percent">Loading render: 0%</div>
		<div class="right">
			<button class="logo" on:click={() => BrowserOpenURL("https://github.com/keelus/kyozora")}>Kyozora <span>· {APP_VERSION}</span></button>
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
  