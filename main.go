package main

import (
	"embed"
	"gyozora/data"
	"gyozora/fileUtils"
	"gyozora/models"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Read JSON extension type data
	fileUtils.LoadJSON()
	data.ConnectDB()

	// Create an instance of the app structure
	app := NewApp()

	macTheme := mac.NSAppearanceNameDarkAqua
	windowsTheme := windows.Dark
	if app.Go_GetSetting("theme") == "light" {
		macTheme = mac.NSAppearanceNameVibrantLight
		windowsTheme = windows.Light
	}

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "gyozora",
		Width:     1024,
		Height:    768,
		MinWidth:  1024,
		MinHeight: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			&models.LeftBarElement{},
			&models.Job{},
		},
		Windows: &windows.Options{
			Theme: windowsTheme,
			CustomTheme: &windows.ThemeSettings{
				DarkModeTitleBar:           windows.RGB(31, 31, 31),
				DarkModeTitleBarInactive:   windows.RGB(0, 0, 0),
				DarkModeTitleText:          windows.RGB(255, 255, 255),
				DarkModeTitleTextInactive:  windows.RGB(175, 175, 175),
				DarkModeBorder:             windows.RGB(54, 54, 54),
				DarkModeBorderInactive:     windows.RGB(0, 0, 0),
				LightModeTitleBar:          windows.RGB(255, 255, 255),
				LightModeTitleBarInactive:  windows.RGB(255, 255, 255),
				LightModeTitleText:         windows.RGB(20, 20, 20),
				LightModeTitleTextInactive: windows.RGB(20, 20, 20),
				LightModeBorder:            windows.RGB(255, 255, 255),
				LightModeBorderInactive:    windows.RGB(255, 255, 255),
			},
		},
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideToolbarSeparator:       true,
			},
			About: &mac.AboutInfo{
				Title:   "Gyozora",
				Message: "© 2023 keelus",
			},
			Appearance: macTheme,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy: linux.WebviewGpuPolicyAlways,
			ProgramName:      "Gyozora",
		},
		Frameless:       false,
		CSSDragProperty: "widows",
		CSSDragValue:    "1",
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
