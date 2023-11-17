<script lang="ts">
import { CURRENT_PATH, USER_OS, languageDictionary, selectedFiles, settings } from "../utils/store";
import Icon from "@iconify/svelte";
import { GetIconByType, IconDictionary } from "../utils/icons";
import { get } from "svelte/store";
import { onMount } from "svelte";
import type { models } from "wailsjs/go/models";
import { PropertiesFile } from '../../wailsjs/go/main/App.js';
import { GenerateToast } from "../utils/toasts";
import { copyToClipboard, renderBytes, renderDate } from "../utils/utils";
import { GetWord } from "../utils/languages";

let cancelButton : HTMLButtonElement;

export async function WaitForModalResponse() {
	if(propertiesFile === undefined){ // Right clicked current folder
		let fileDataResponse = await PropertiesFile(get(CURRENT_PATH))
		if(fileDataResponse.error.status) {
			GenerateToast("error", GetWord("modalPropertiesFailed"), "📄")
			return new Promise(resolve => resolve(-1))
		} else {
			fileData = fileDataResponse.file
		}
	} else fileData = propertiesFile

	return new Promise(resolve => {
		cancelButton.addEventListener("click", () => {
			resolve(-1)
		})
	})
}

let fileData : models.SysFile;
export let propertiesFile : models.SysFile | undefined;
</script>
<div class="modal properties">
	{#if fileData !== undefined}
		<div class="top">
			<div class="title">{GetWord("modalPropertiesTitle")} {fileData.filename}</div>
		</div>
		<div class="middle" style="display:block;">
			<div class="flexContent">
				<div class="doubleField">
					<div class="key">
						{#if fileData.iconClass == "fileImage" && fileData.preview != ""}
							<div class="imagePreview" style="background-image:url(data:image/png;base64,{fileData.preview});{fileData.extension == ".svg" ? "background-color:white;" : ""}"></div>
						{:else}
						
							<Icon icon={GetIconByType(fileData.iconClass)} class="icon {fileData.iconClass} {$USER_OS}"/>
						{/if}
					</div>
					<button class="value" on:click={() => copyToClipboard(fileData.filename)}>
						<div class="text" title={fileData.filename}>{fileData.filename}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				<div class="divider"></div>
				<div class="doubleField">
					<div class="key">{GetWord("modalPropertiesFieldType")}</div>
					<button class="value" on:click={() => copyToClipboard(fileData.iconClass)}>
						<div class="text" title={fileData.iconClass}>{fileData.iconClass}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				<div class="doubleField">
					<div class="key">{GetWord("modalPropertiesFieldLocation")}</div>
					<button class="value" on:click={() => copyToClipboard(fileData.path)}>
						<div class="text" title={fileData.path}>{fileData.path}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
				{#if !fileData.isFolder}
					<div class="doubleField">
						<div class="key">{GetWord("modalPropertiesFieldSize")}</div>
						<button class="value" on:click={() => copyToClipboard(renderBytes(fileData.size))}>
							<div class="text" title={renderBytes(fileData.size)}>{renderBytes(fileData.size)}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
						</button>
					</div>
				{/if}
				<div class="divider"></div>
				<div class="doubleField">
					<div class="key">{GetWord("modalPropertiesFieldModification")}</div>
					<button class="value" on:click={() => copyToClipboard(renderDate(fileData.modifiedAt))}>
						<div class="text" style="font-size:13px;" title={renderDate(fileData.modifiedAt)}>{renderDate(fileData.modifiedAt)}</div>
						<Icon icon={GetIconByType("uiCopy")} class="icon {$USER_OS}"/>
					</button>
				</div>
			</div>
		</div>
	{/if}
	<div class="bottom">
		<button class="cancel" style="margin-left:auto;" bind:this={cancelButton}>{GetWord("modalBtnClose")}</button>
	</div>
</div>