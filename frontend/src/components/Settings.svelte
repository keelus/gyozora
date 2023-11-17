<script lang="ts">
import { IconDictionary } from '../utils/icons';
import Icon from '@iconify/svelte';
import { GetSetting, SetSetting, ChangePinned } from '../utils/settings';
import { languageDictionary, settings, pinnedFolders, USER_OS } from '../utils/store';
import { BrowserOpenURL } from '../../wailsjs/runtime/runtime'

import appicon from '../assets/icons/gyozora.svg'
import paintBrushLine from '@iconify/icons-ri/paint-brush-line';
import gridFill from '@iconify/icons-ri/grid-fill';
import accessibilityIcon from '@iconify/icons-material-symbols/accessibility';
import imageFill from '@iconify/icons-ri/image-fill';
import githubLine from '@iconify/icons-ri/github-line';

import { Switch } from '@svelteuidev/core';
import type { models } from 'wailsjs/go/models';
import { Go_CacheSize, Go_CacheClear } from '../../wailsjs/go/main/App';

import darkThemeIMG from '../assets/images/darkTheme.png'
import lightThemeIMG from '../assets/images/lightTheme.png'
import { GetWord } from '../utils/languages';

import { renderBytes } from '../utils/utils';
  import { GenerateToast } from '../utils/toasts';


let activeCategory = 0;
let cacheSize = 0


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
		GenerateToast("error", GetWord("cacheEmptyError"), "🧹")
	else {
		cacheSize = 0
		GenerateToast("success", GetWord("cacheEmptySuccess"), "🧹")
	}
}

let opened = false;

enum SettingCategories {
    APPEARANCE = 0,
    VIEW_SETTINGS,
    ACCESSIBILITY,
	IMAGE_PREVIEWS,
	ABOUT
}

$: lang = $settings && $languageDictionary

</script>
<div class="settingsOuter" class:opened={opened}>
	<div class="settingsWindow">
		<div class="top">
			<div class="title"><img src={appicon} alt="Gyozora icon" class="appicon"/> {lang && GetWord("settingsTitle")}</div>
			<button class="closeButton" on:click={CloseSettings}>
				<Icon icon={IconDictionary["uiClose"]} class="icon "/>
			</button>
			
		</div>
		
		<div class="bottom">
			<div class="categories">
				<button class="category" class:active={activeCategory == SettingCategories.APPEARANCE} on:click={() => activeCategory = SettingCategories.APPEARANCE}>
					<div class="title"><Icon icon={paintBrushLine} class="icon" /> {lang && GetWord("settingsCatAppearance")}</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.VIEW_SETTINGS} on:click={() => activeCategory = SettingCategories.VIEW_SETTINGS}>
					<div class="title"><Icon icon={gridFill} class="icon" /> {lang && GetWord("settingsCatViewSettings")}</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.ACCESSIBILITY} on:click={() => activeCategory = SettingCategories.ACCESSIBILITY}>
					<div class="title"><Icon icon={accessibilityIcon} class="icon" /> {lang && GetWord("settingsCatAccessibility")}</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.IMAGE_PREVIEWS} on:click={() => activeCategory = SettingCategories.IMAGE_PREVIEWS}>
					<div class="title"><Icon icon={imageFill} class="icon" /> {lang && GetWord("settingsCatImagePreviews")}</div>
				</button>
				<button class="category" class:active={activeCategory == SettingCategories.ABOUT} on:click={() => activeCategory = SettingCategories.ABOUT} style="margin-top:auto;" >
					<div class="title"><Icon icon={githubLine} class="icon" /> {lang && GetWord("settingsCatAbout")}</div>
				</button>
			</div>
			<div class="content">
				{#if activeCategory == SettingCategories.APPEARANCE}
					<div class="element">
						<div class="title">{lang && GetWord("settingsAppearanceThemeTitle")}</div>
						<div class="description">{lang && GetWord("settingsAppearanceThemeDesc")}</div>
						<div class="themes">
							<button class="theme" class:active={$settings && GetSetting("theme") == "dark"} on:click={() => SetSetting("theme", "dark")}>
								<div class="top" style="background-image:url('{darkThemeIMG}');"></div>
								<div class="bottom">
									<div class="check"></div>
									<div class="title">{lang && GetWord("settingsAppearanceThemeDark")}</div>
								</div>
							</button>
							<button class="theme" class:active={$settings && GetSetting("theme") == "light"} on:click={() => SetSetting("theme", "light")}>
								<div class="top" style="background-image:url('{lightThemeIMG}');"></div>
								<div class="bottom">
									<div class="check"></div>
									<div class="title">{lang && GetWord("settingsAppearanceThemeLight")}</div>
								</div>
							</button>
						</div>
					</div>
				{:else if activeCategory == SettingCategories.VIEW_SETTINGS}
					<div class="element">
						<div class="title">{lang && GetWord("settingsImagePreviewsZoomTitle")}</div>
						<div class="double">
							<div class="description">{lang && GetWord("settingsImagePreviewsZoomDesc")}</div>
							<div class="value">
								<input type="range" min="50" max="150" value={$settings && GetSetting("zoomLevel")} on:change={(e) => SetSetting("zoomLevel", e.target.value)}><span>{$settings && GetSetting("zoomLevel")}%</span>
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">{lang && GetWord("settingsImagePreviewsExtensionsTitle")}</div>
						<div class="double">
							<div class="description">{lang && GetWord("settingsImagePreviewsExtensionsDesc")}</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showExtensions") === "true"} on:change={(e) => SetSetting("showExtensions", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">{lang && GetWord("settingsImagePreviewsHiddenTitle")}</div>
						<div class="double">
							<div class="description">{lang && GetWord("settingsImagePreviewsHiddenDesc")}</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showHiddenFiles") === "true"} on:change={(e) => SetSetting("showHiddenFiles", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
				{:else if activeCategory == SettingCategories.ACCESSIBILITY}
					<div class="element">
						<div class="title">{lang && GetWord("settingsAccessibilityLanguageTitle")}</div>
						<div class="description">{lang && GetWord("settingsAccessibilityLanguageDesc")}</div>
						<button class="option"  class:active={$settings && GetSetting("language") == "EN"} on:click={() => SetSetting("language", "EN")}>{lang && GetWord("settingsAccessibilityLanguageBtnEN")}</button>
						<button class="option"  class:active={$settings && GetSetting("language") == "ES"} on:click={() => SetSetting("language", "ES")}>{lang && GetWord("settingsAccessibilityLanguageBtnES")}</button>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">{lang && GetWord("settingsAccessibilityBreadcrumbsTitle")}</div>
						<div class="double">
							<div class="description">{lang && GetWord("settingsAccessibilityBreadcrumbsDesc")}</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showBreadcrumbs") === "true"} on:change={(e) => SetSetting("showBreadcrumbs", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element">
						<div class="title">{lang && GetWord("settingsAccessibilityDeleteConfirmationTitle")}</div>
						<div class="double">
							<div class="description">{lang && GetWord("settingsAccessibilityDeleteConfirmationDesc")}</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("showDeleteConfirmation") === "true"} on:change={(e) => SetSetting("showDeleteConfirmation", (e.target.checked).toString())} />
							</div>
						</div>
					</div>
					
					<div class="dividerH"></div>

					<div class="element" style="--text:'{lang && GetWord("settingsInDevelopment")}';">
						<div class="title">{lang && GetWord("settingsAccessibilityFastAccessTitle")}</div>
						<div class="description">{lang && GetWord("settingsAccessibilityFastAccessDesc")}</div>

						<div class="settingsPinnedFolders">
							{#if $pinnedFolders.length === 0}
							<div class="emptyMessage">
								{lang && GetWord("settingsAccessibilityFastAccessEmptyMessage")}
							</div>
							{:else }
								{#each $pinnedFolders as content, i}
									<div class="pinnedFolder">
										<Icon icon={IconDictionary[content.iconClass]} class="icon {content.iconClass} {$USER_OS}"/>
										<div class="name">{content.filename}</div>
										<button class="buttonUp" on:click={e => ChangePinned(content.pathfull, i - 1)}><Icon icon={IconDictionary["uiArrowUp"]} class="icon"/></button>
										<button class="buttonDown" on:click={e => ChangePinned(content.pathfull, i + 1)}><Icon icon={IconDictionary["uiArrowDown"]} class="icon"/></button>
										<button class="buttonDelete" on:click={e => ChangePinned(content.pathfull, -1)}><Icon icon={IconDictionary["ctxMenuRemoveFromPinned"]} class="icon"/></button>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{:else if activeCategory == SettingCategories.IMAGE_PREVIEWS}
					<div class="element">
						<div class="title">{lang && GetWord("settingsImagePreviewsThumbnailsTitle")}</div>
						<div class="double">
							<div class="description">{lang && GetWord("settingsImagePreviewsThumbnailsDesc")}</div>
							<div class="value">
								<Switch size="md" checked={$settings && GetSetting("useThumbnails") === "true"} on:change={(e) => SetSetting("useThumbnails", (e.target.checked).toString())} />
							</div>
						</div>
					</div>

					<div class="dividerH"></div>

					{#if $settings && GetSetting("useThumbnails") === "true"}
						<div class="element">
							<div class="title">{lang && GetWord("settingsImagePreviewsCacheTitle")}</div>
							<div class="double">
								<div class="description">{lang && GetWord("settingsImagePreviewsCacheDesc")}</div>
								<div class="value">
									<Switch size="md" checked={$settings && GetSetting("useCache") === "true"} on:change={(e) => SetSetting("useCache", (e.target.checked).toString())} />
								</div>
							</div>
						</div>
					{/if}
					<div class="element">
						<div class="double">
							<div class="description" style="flex:unset;margin-right:10px;">{lang && GetWord("settingsImagePreviewsCacheInUse")}: {renderBytes(cacheSize) }</div>
							<div class="value">
								<button class="cacheButton" disabled={cacheSize === 0} on:click={() => ClearCache()} >{lang && GetWord("settingsImagePreviewsCacheBtn")}</button>
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