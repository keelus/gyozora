<script lang="ts">
import { IconDictionary } from './icons';
import Icon from '@iconify/svelte';
import { GetSetting, SetSetting } from './settings';
import { settings } from './store';
import { BrowserOpenURL } from '../wailsjs/runtime/runtime'

import appicon from './assets/icons/gyozora.svg'
import paintBrushLine from '@iconify/icons-ri/paint-brush-line';
import gridFill from '@iconify/icons-ri/grid-fill';
import accessibilityIcon from '@iconify/icons-material-symbols/accessibility';
import imageFill from '@iconify/icons-ri/image-fill';
import githubLine from '@iconify/icons-ri/github-line';

import { Switch } from '@svelteuidev/core';
import type { models } from 'wailsjs/go/models';
import { Go_CacheSize, Go_CacheClear } from '../wailsjs/go/main/App';

import darkThemeIMG from './assets/images/darkTheme.png'
import lightThemeIMG from './assets/images/lightTheme.png'


let activeCategory = 0;
let cacheSize = "0B"


export async function OpenSettings() {
	cacheSize = await Go_CacheSize()


	opened = true;
	activeCategory = 0;
}

export function CloseSettings() {
	opened = false;
}

async function ClearCache() {
	const error : models.SimpleError = await Go_CacheClear()
	if(error.status) 
		console.log("Error clearing cache")
	else cacheSize = "0B"
}

let opened = false;

enum SettingCategories {
    APPEARANCE = 0,
    VIEW_SETTINGS,
    ACCESSIBILITY,
	IMAGE_PREVIEWS,
	ABOUT
}

</script>
<div class="settingsOuter" class:opened={opened}>
	<div class="settingsWindow">
		<div class="top">
			<div class="title"><img src={appicon} alt="Gyozora icon" class="appicon"/> Gyozora settings</div>
			<button class="closeButton" on:click={CloseSettings}>
				<Icon icon={IconDictionary["uiClose"]} class="icon "/>
			</button>
			
		</div>
		
		<div class="bottom">
			<div class="categories">
				<button class="category" class:active={activeCategory == SettingCategories.APPEARANCE} on:click={() => activeCategory = SettingCategories.APPEARANCE}>
					<div class="title"><Icon icon={paintBrushLine} class="icon" /> Appearance</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.VIEW_SETTINGS} on:click={() => activeCategory = SettingCategories.VIEW_SETTINGS}>
					<div class="title"><Icon icon={gridFill} class="icon" /> View settings</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.ACCESSIBILITY} on:click={() => activeCategory = SettingCategories.ACCESSIBILITY}>
					<div class="title"><Icon icon={accessibilityIcon} class="icon" /> Accessibility</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.IMAGE_PREVIEWS} on:click={() => activeCategory = SettingCategories.IMAGE_PREVIEWS}>
					<div class="title"><Icon icon={imageFill} class="icon" /> Image previews</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.ABOUT} on:click={() => activeCategory = SettingCategories.ABOUT} style="margin-top:auto;" >
					<div class="title"><Icon icon={githubLine} class="icon" /> About gyozora</div>
				</button>
			</div>
			<div class="content">
				{#if activeCategory == SettingCategories.APPEARANCE}
					<div class="element">
						<div class="title">Theme</div>
						<div class="description">Choose the main theme for gyozora.</div>
						<div class="themes">
							<button class="theme" class:active={$settings && GetSetting("theme") == "dark"} on:click={() => SetSetting("theme", "dark")}>
								<div class="top" style="background-image:url('{darkThemeIMG}');"></div>
								<div class="bottom">
									<div class="check"></div>
									<div class="title">Dark theme</div>
								</div>
							</button>
							<button class="theme" class:active={$settings && GetSetting("theme") == "light"} on:click={() => SetSetting("theme", "light")}>
								<div class="top" style="background-image:url('{lightThemeIMG}');"></div>
								<div class="bottom">
									<div class="check"></div>
									<div class="title">Light theme</div>
								</div>
							</button>
						</div>
					</div>

					<div class="dividerH"></div>

					<div class="element">
						<div class="title">Transparency</div>
						<div class="double">
							<div class="description">Control how many transparency has the app window.</div>
							<div class="value">
								<input type="range" max="100" value={$settings && GetSetting("transparency")} on:change={(e) => SetSetting("transparency", e.target.value)}><span style="color:white;">{$settings && GetSetting("transparency")}</span>
							</div>
						</div>
					</div>
				{:else if activeCategory == SettingCategories.VIEW_SETTINGS}
					<div class="element inDevelopment">
						<div class="title">Zoom level</div>
						<div class="double">
							<div class="description">Change the explorer icon list zoom amount.</div>
							<div class="value">
								<input type="range" min="50" max="150" value={$settings && GetSetting("zoomLevel")} on:change={(e) => SetSetting("zoomLevel", e.target.value)}><span style="color:white;">{$settings && GetSetting("zoomLevel")}</span>
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">Show file extensions</div>
						<div class="double">
							<div class="description">Choose wether to show or hide the file extensions on the file explorer.</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showExtensions") === "true"} on:change={(e) => SetSetting("showExtensions", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">Show hidden files</div>
						<div class="double">
							<div class="description">Choose wether to show or hide the system hidden files on the file explorer.</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showHiddenFiles") === "true"} on:change={(e) => SetSetting("showHiddenFiles", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
				{:else if activeCategory == SettingCategories.ACCESSIBILITY}
					<div class="element inDevelopment">
						<div class="title">Language</div>
						<div class="description">Choose your preferred language in gyozora.</div>
						<button class="option"  class:active={$settings && GetSetting("language") == "EN"} on:click={() => SetSetting("language", "EN")}>English</button>
						<button class="option"  class:active={$settings && GetSetting("language") == "ES"} on:click={() => SetSetting("language", "ES")}>Spanish</button>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">Show breadcrumbs</div>
						<div class="double">
							<div class="description">Choose wether to show or not the bottom left breadcrumbs.</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showBreadcrumbs") === "true"} on:change={(e) => SetSetting("showBreadcrumbs", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">Show delete confirmation</div>
						<div class="double">
							<div class="description">This confirmation dialog appears when trying to delete a file.</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showDeleteConfirmation") === "true"} on:change={(e) => SetSetting("showDeleteConfirmation", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element inDevelopment">
						<div class="title">Fast access folders</div>
						<div class="description">Add, edit or delete your fast access folders, which appears in the left sidebar.</div>
					</div>
				{:else if activeCategory == SettingCategories.IMAGE_PREVIEWS}
					<div class="element">
						<div class="title">Use image thumbnails</div>
						<div class="double">
							<div class="description">Show image files' previews when using the explorer (supported for png, jpegs, gifs and webp files).</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("useThumbnails") === "true"} on:change={(e) => SetSetting("useThumbnails", (e.target.checked).toString())} />
							</div>
						</div>
					</div>

					<div class="dividerH"></div>

					{#if $settings && GetSetting("useThumbnails") === "true"}
						<div class="element">
							<div class="title">Use cache</div>
							<div class="double">
								<div class="description">Save the rendered image previews into cache, to get blazingly fast previews!</div>
								<div class="value">
									<Switch size="md" checked={$settings && GetSetting("useCache") === "true"} on:change={(e) => SetSetting("useCache", (e.target.checked).toString())} />
								</div>
							</div>
						</div>
					{/if}
					<div class="element">
						<div class="double">
							<div class="description" style="flex:unset;margin-right:10px;">Cache in use: {cacheSize}</div>
							<div class="value">
								<button class="cacheButton" disabled={cacheSize === "0B"} on:click={() => ClearCache()} >Empty cache</button>
							</div>
						</div>
					</div>

					{:else if activeCategory == SettingCategories.ABOUT}
						<div class="about">
							Gyozora is an open-source file explorer created by <button on:click={() => BrowserOpenURL("https://github.com/keelus")}>keelus</button>, written in Golang & Svelte, currently in development.<br><br>
							This project is under the GNU GLP v3.0 license. <br><br>
							Check the GitHub repository <button on:click={() => BrowserOpenURL("https://github.com/keelus/gyozora")}>here</button>.
						</div>
					{/if}
			</div>
		</div>
	</div>
</div>