<script lang="ts">
import appicon from './assets/icons/gyozora.svg'
import paintBrushLine from '@iconify/icons-ri/paint-brush-line';
import gridFill from '@iconify/icons-ri/grid-fill';
import accessibilityIcon from '@iconify/icons-material-symbols/accessibility';
import imageFill from '@iconify/icons-ri/image-fill';
import { IconDictionary } from './icons';
import Icon from '@iconify/svelte';
import { GetSetting, SetSetting } from './settings';
import { settings } from './store';

export async function OpenSettings() {
	// Re-load settings ?
	opened = true;
}
export function CloseSettings() {
	opened = false;
}

let opened = false;

enum SettingCategories {
    APPEARANCE = 0,
    VIEW_SETTINGS,
    ACCESSIBILITY,
	IMAGE_PREVIEWS
}
let activeCategory = 0;

</script>
<div class="settingsOuter {opened ? "opened" : ""}">
	<div class="settingsWindow">
		<div class="top">
			<div class="title"><img src={appicon} alt="Gyozora icon" class="appicon"/> Gyozora settings</div>
			<button class="closeButton" on:click={CloseSettings}>
				<Icon icon={IconDictionary["uiClose"]} class="icon "/>
			</button>
			
		</div>
		
		<div class="bottom">
			<div class="categories">
				<button class="category {activeCategory == SettingCategories.APPEARANCE ? "active" : ""}" on:click={() => activeCategory = 0}>
					<div class="title"><Icon icon={paintBrushLine} class="icon" /> Appearance</div>
				</button>
				<button class="category {activeCategory == SettingCategories.VIEW_SETTINGS ? "active" : ""}" on:click={() => activeCategory = 1}>
					<div class="title"><Icon icon={gridFill} class="icon" /> View settings</div>
				</button>
				<button class="category {activeCategory == SettingCategories.ACCESSIBILITY ? "active" : ""}" on:click={() => activeCategory = 2}>
					<div class="title"><Icon icon={accessibilityIcon} class="icon" /> Accessibility</div>
				</button>
				<button class="category {activeCategory == SettingCategories.IMAGE_PREVIEWS ? "active" : ""}" on:click={() => activeCategory = 3}>
					<div class="title"><Icon icon={imageFill} class="icon" /> Image previews</div>
				</button>
			</div>
			<div class="content">
				{#if activeCategory == SettingCategories.APPEARANCE}
					<div class="title">Appearance</div>

					<div class="element">
						<h3>Theme</h3>
						<p>Choose the main theme for gyozora.</p>
						<button class="option" class:active={$settings && GetSetting("theme") == "dark"} on:click={() => SetSetting("theme", "dark")}>Dark</button>
						<button class="option" class:active={$settings && GetSetting("theme") == "light"} on:click={() => SetSetting("theme", "light")}>Light</button>
					</div>

					<div class="element">
						<h3>Transparency</h3>
						<p>Control how many transparency has the app window.</p>
						<input type="range" max="100" value={$settings && GetSetting("transparency")} on:change={(e) => SetSetting("transparency", e.target.value)}><span style="color:white;">{$settings && GetSetting("transparency")}</span>
					</div>

					<div class="element">
						<h3>Color theme</h3>
						<p>Swap for a different color theme of icons, buttons, etc.</p>
						<button class="option" class:active={$settings && GetSetting("colorTheme") == "default"} on:click={() => SetSetting("colorTheme", "default")}>Default</button>
					</div>
				{:else if activeCategory == SettingCategories.VIEW_SETTINGS}
					<div class="title">View settings</div>

					<div class="element">
						<h3>Zoom level</h3>
						<p>Change the explorer icon list zoom amount.</p>
						<input type="range" min="50" max="150" value={$settings && GetSetting("zoomLevel")} on:change={(e) => SetSetting("zoomLevel", e.target.value)}><span style="color:white;">{$settings && GetSetting("zoomLevel")}</span>
					</div>

					<div class="element">
						<h3>Show file extensions</h3>
						<input type="checkbox" checked={$settings && GetSetting("showExtensions") === "true"} on:change={(e) => SetSetting("showExtensions", (e.target.checked).toString())}><span style="color:white;">{$settings && GetSetting("showExtensions")}</span>
					</div>

					<div class="element">
						<h3>Show hidden files</h3>
						<input type="checkbox" checked={$settings && GetSetting("showHiddenFiles") === "true"} on:change={(e) => SetSetting("showHiddenFiles", (e.target.checked).toString())}><span style="color:white;">{$settings && GetSetting("showHiddenFiles")}</span>
					</div>
				{:else if activeCategory == SettingCategories.ACCESSIBILITY}
					<div class="title">Accessibility</div>

					<div class="element">
						<h3>Language</h3>
						<button class="option"  class:active={$settings && GetSetting("language") == "EN"} on:click={() => SetSetting("language", "EN")}>English</button>
						<button class="option"  class:active={$settings && GetSetting("language") == "ES"} on:click={() => SetSetting("language", "ES")}>Spanish</button>
					</div>

					<div class="element">
						<h3>Show breadcrumbs</h3>
						<p>Choose wether to show or not the bottom left breadcrumbs.</p>
						<input type="checkbox" checked={$settings && GetSetting("showBreadcrumbs") === "true"} on:change={(e) => SetSetting("showBreadcrumbs", (e.target.checked).toString())}><span style="color:white;">{$settings && GetSetting("showBreadcrumbs")}</span>
					</div>

					<div class="element">
						<h3>Show delete confirmation</h3>
						<p>This confirmation dialog appears when trying to delete a file.</p>
						<input type="checkbox" checked={$settings && GetSetting("showDeleteConfirmation") === "true"} on:change={(e) => SetSetting("showDeleteConfirmation", (e.target.checked).toString())}><span style="color:white;">{$settings && GetSetting("showDeleteConfirmation")}</span>
					</div>

					<div class="element">
						<h3>Fast access folders</h3>
						<p>Add, edit or delete your fast access folders, which appears in the left sidebar.</p>
					</div>
				{:else if activeCategory == SettingCategories.IMAGE_PREVIEWS}
					<div class="title">Image previews</div>

					<div class="element">
						<h3>Use image thumbnails</h3>
						<p>Show image files' previews when using the explorer (supported for png, jpegs, gifs and webp files).</p>
						<input type="checkbox" checked={$settings && GetSetting("useThumbnails") === "true"} on:change={(e) => SetSetting("useThumbnails", (e.target.checked).toString())}><span style="color:white;">{$settings && GetSetting("useThumbnails")}</span>
					</div>
					{#if $settings && GetSetting("useThumbnails") === "true"}
						<div class="element">
							<h3>Use cache</h3>
							<p>Save the rendered image previews into cache, to get blazingly fast previews!</p>
							<input type="checkbox" checked={$settings && GetSetting("useCache") === "true"} on:change={(e) => SetSetting("useCache", (e.target.checked).toString())}><span style="color:white;">{$settings && GetSetting("useCache")}</span>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>