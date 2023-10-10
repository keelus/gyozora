package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"kyozora/fileUtils"
	"kyozora/models"
	"kyozora/sysUtils"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet() {
	fmt.Println("Hello world ✌️")
}

func (a *App) ReadPath(path string) []models.SysFile {
	returningFiles := make([]models.SysFile, 0)

	files, err := ioutil.ReadDir(path)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {

		name := file.Name()[:len(file.Name())-len(filepath.Ext(file.Name()))]
		extension := strings.ToLower(filepath.Ext(file.Name()))
		fullPath := filepath.Join(path, file.Name())

		newFile := models.SysFile{
			Name:        name,
			Extension:   extension,
			Filename:    file.Name(),
			Permissions: file.Mode().Perm().String(),
			Path:        path,
			PathFull:    fullPath,
			Size:        int(file.Size()),
			IconClass:   fileUtils.GetFileType(file.Name(), extension, file.IsDir()),
			IsFolder:    file.IsDir(),
			IsHidden:    fileUtils.IsHidden(fullPath),
			CreatedAt:   fileUtils.CreatedAt(fullPath),
			ModifiedAt:  fileUtils.ModifiedAt(fullPath),
		}

		returningFiles = append(returningFiles, newFile)
	}

	return returningFiles
}

func (a *App) OpenFile(fpath string) {
	fmt.Println(fmt.Sprintf("\"%s\"", fpath))
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin": // macOS
		cmd = exec.Command("open", fpath)
	case "linux":
		cmd = exec.Command("xdg-open", fpath)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", "", fpath)
	default:
		fmt.Println("Unsupported operating system")
		os.Exit(1)
	}

	fmt.Println("Trying to execute the co")
	fmt.Println(cmd)
	err := cmd.Run()
	if err != nil {
		fmt.Printf("Error opening the file: %v\n", err)
	}
}

func (a *App) LoadPinnedFolders() []models.LeftBarElement {

	pinnedFolders := make([]models.LeftBarElement, 0)
	pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Desktop", Type: "folderDesktop", Path: filepath.Join(sysUtils.UserHomedir(), "Desktop")})
	pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Downloads", Type: "folderDownloads", Path: filepath.Join(sysUtils.UserHomedir(), "Downloads")})
	pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Documents", Type: "folderDocuments", Path: filepath.Join(sysUtils.UserHomedir(), "Documents")})
	pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Pictures", Type: "folderPictures", Path: filepath.Join(sysUtils.UserHomedir(), "Pictures")})
	pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Music", Type: "folderMusic", Path: filepath.Join(sysUtils.UserHomedir(), "Music")})
	pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: sysUtils.UserHomedir(), Type: "folder", Path: sysUtils.UserHomedir()})

	return pinnedFolders
}
func (a *App) LoadYourComputer() []models.LeftBarElement {
	userRoots := sysUtils.UserRoots()
	pinnedFolders := make([]models.LeftBarElement, 0)
	for i := 0; i < len(userRoots); i++ {
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: fmt.Sprintf("Disk %d (%s)", i, userRoots[i]), Type: "folderDisk", Path: userRoots[i]})
	}

	return pinnedFolders
}
func (a *App) GetStartingPath() string {
	return filepath.Join(sysUtils.UserHomedir(), "Desktop")
}
