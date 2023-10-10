<script>
	import logo from './assets/images/logo-universal.png'
	import { GetStartingPath, LoadPinnedFolders, LoadYourComputer, OpenFile } from '../wailsjs/go/main/App.js'
	import { ReadPath } from '../wailsjs/go/main/App.js';
	import { Home, Laptop2, FolderDown, File, Image, Music, HardDrive, ArrowLeft, ArrowRight, FileImage, FileVideo2, FileAudio2, Folder, ChevronRight, FileArchive, FileTerminal, FileType, FileText, HelpCircleIcon, FileCode, FileJson, AppWindow } from 'lucide-svelte';
  

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
	  ReadDirectory(CURRENT_PATH)
	}
  
	async function ReadDirectory(path) {
	  CURRENT_PATH = path
	  contents = []
	  const directoryElements = await ReadPath(path)
	  
	  const newElements = directoryElements.map((element) => ({
		  ...element,
	  }))
	  
	  contents = newElements
	}
  
  
  function elementClicked(fpath, isfolder) {
	  if(isfolder){
		  console.log("Opening a folder 📂")
		  return ReadDirectory(fpath)
	  }
  
	  OpenFile(fpath)
	  console.log("Opening a file 🍎")
	  console.log(fpath, isfolder)
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
  
  document.addEventListener("keydown", (e) => {
	  if(e.key == "Enter")
		  FirstStart()
  })
  
  
  </script>
  
  <main>
	  <div class="toolbar"></div>
	  <div class="pathbar">
		  <button class="backButton" disabled><ArrowLeft class="icon"/></button>
		  <button class="forwardButton" on:click={() => ReadDirectory(CURRENT_PATH)}><ArrowRight class="icon" /></button>
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
					  <svelte:component this={GetIconByType(content.iconClass)} class="icon {content.iconClass}"/>
					  <div class="text">{content.filename}</div>
				  </button>
			  {/each}
		  </div>
	  </div>
	  <div class="breadcrumb">
		  <div class="element">
			  <HardDrive class="icon disk"/>
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
			  <Laptop2 class="icon desktop"/>
			  <div class="text">Desktop</div>
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
  