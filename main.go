package main

import (
	"embed"
	"gyozora/appcache"
	"gyozora/fileUtils"
	"gyozora/models"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Read JSON extension type data
	fileUtils.LoadJSON()
	appcache.ConnectDB()

	// Create an instance of the app structure
	app := NewApp()

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
		},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			BackdropType:         windows.Acrylic,
			Theme:                windows.SystemDefault,
			CustomTheme: &windows.ThemeSettings{
				DarkModeTitleBar:           windows.RGB(20, 20, 20),
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
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			Appearance:           mac.NSAppearanceNameDarkAqua,
			About: &mac.AboutInfo{
				Title:   "Gyozora",
				Message: "© 2023 keelus",
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
