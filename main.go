package main

import (
	"embed"
	"kyozora/appcache"
	"kyozora/fileUtils"
	"kyozora/models"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
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
		Title:     "kyozora",
		Width:     1024,
		Height:    768,
		MinWidth:  1024,
		MinHeight: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			&models.Kirina{},
			&models.LeftBarElement{},
		},
		Windows: &windows.Options{
			Theme: windows.SystemDefault,
			CustomTheme: &windows.ThemeSettings{
				DarkModeTitleBar:   windows.RGB(20, 20, 20),
				DarkModeTitleText:  windows.RGB(255, 255, 255),
				DarkModeBorder:     windows.RGB(20, 20, 20),
				LightModeTitleBar:  windows.RGB(255, 255, 255),
				LightModeTitleText: windows.RGB(0, 0, 0),
				LightModeBorder:    windows.RGB(255, 255, 255),
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
