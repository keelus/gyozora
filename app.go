package main

import (
	"context"
	"fmt"
	"gyozora/appcache"
	"gyozora/fileUtils"
	"gyozora/models"
	"gyozora/sysUtils"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

var CURRENT_PATH = ""

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

func (a *App) GetUserOS() string {
	return runtime.GOOS
}

func (a *App) ReadPath(path string) []models.SysFile {
	fmt.Println("########## FOLDER READ ##########")
	CURRENT_PATH = path
	returningFiles := make([]models.SysFile, 0)

	files, err := ioutil.ReadDir(path)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {

		name := file.Name()[:len(file.Name())-len(filepath.Ext(file.Name()))]
		extension := strings.ToLower(filepath.Ext(file.Name()))
		fullPath := filepath.Join(path, file.Name())
		fileType := fileUtils.GetFileType(file.Name(), extension, file.IsDir())

		preview := ""
		// if fileType == "fileImage" {
		// 	preview = fileUtils.GetImagePreview(fullPath, extension)
		// }

		newFile := models.SysFile{
			Name:        name,
			Extension:   extension,
			Filename:    file.Name(),
			Permissions: file.Mode().Perm().String(),
			Path:        path,
			PathFull:    fullPath,
			Size:        int(file.Size()),
			IconClass:   fileType,
			IsFolder:    file.IsDir(),
			IsHidden:    fileUtils.IsHidden(fullPath),
			ModifiedAt:  fileUtils.ModifiedAt(fullPath),
			Preview:     preview,
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

	if runtime.GOOS == "windows" {
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Desktop", Type: "folderDesktop", Path: filepath.Join(sysUtils.UserHomedir(), "Desktop")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Downloads", Type: "folderDownloads", Path: filepath.Join(sysUtils.UserHomedir(), "Downloads")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Documents", Type: "folderDocuments", Path: filepath.Join(sysUtils.UserHomedir(), "Documents")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Pictures", Type: "folderPictures", Path: filepath.Join(sysUtils.UserHomedir(), "Pictures")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Music", Type: "folderMusic", Path: filepath.Join(sysUtils.UserHomedir(), "Music")})
	} else if runtime.GOOS == "darwin" {
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Applications", Type: "folderApplications", Path: filepath.Join(sysUtils.UserHomedir(), "Applications")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Desktop", Type: "folderDesktop", Path: filepath.Join(sysUtils.UserHomedir(), "Desktop")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Documents", Type: "folderDocuments", Path: filepath.Join(sysUtils.UserHomedir(), "Documents")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Downloads", Type: "folderDownloads", Path: filepath.Join(sysUtils.UserHomedir(), "Downloads")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Pictures", Type: "folderPictures", Path: filepath.Join(sysUtils.UserHomedir(), "Pictures")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Music", Type: "folderMusic", Path: filepath.Join(sysUtils.UserHomedir(), "Music")})
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Movies", Type: "folderMovies", Path: filepath.Join(sysUtils.UserHomedir(), "Movies")})
	}

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
	CURRENT_PATH = sysUtils.UserHomedir()
	return filepath.Join(CURRENT_PATH, "Desktop")
}

// TODO: Save running batch jobs by unix in a map, so each job is independent, but can force other previous jobs
// to be cancelled.
var ACTIVE_JOBS = -1

func (a *App) RenderPreview(file models.SysFile, unixBeginning int, remaining int) models.SysFile {
	fmt.Printf("Received remainings: %d\n", remaining)

	if ACTIVE_JOBS != -1 { // There is a currently active JOB
		fmt.Println("There is one job in progress")
		if ACTIVE_JOBS != unixBeginning { // If it's not our job, cancel the other job
			fmt.Println("it's not ours")
			ACTIVE_JOBS = unixBeginning
		}
	}

	ACTIVE_JOBS = unixBeginning

	if ACTIVE_JOBS != unixBeginning { // We were cancelled
		fmt.Println("✅🛑 render was canceled. 1")
		return file
	}

	if file.IconClass != "fileImage" {
		if remaining == 0 {
			ACTIVE_JOBS = -1
		}
		return file
	}

	imageIsCached := true
	imageIsLatest := false

	//Check on DB if exists:
	b64img, imageIsLatest, err := appcache.GetCachedPreview(file)
	if err != nil {
		imageIsCached = false
	}

	if imageIsCached && imageIsLatest {
		fmt.Printf("👁️ '%s' is cached & updated, ignoring.\n", file.Filename)
		file.Preview = b64img
		return file
	}
	// Image is not cached, or is not the latest version

	fmt.Printf("📸 creating preview of '%s'\n", file.Filename)

	generatedPreview := fileUtils.GetImagePreview(file.PathFull, file.Extension)
	file.Preview = generatedPreview

	if ACTIVE_JOBS != unixBeginning {
		fmt.Println("✅🛑 render was canceled. 2")
		return file
	}

	// Create or update preview in cache
	if imageIsCached {
		_, err = appcache.DBCache.Query("UPDATE cache SET dateModification=?, preview=? WHERE pathfull=?", file.ModifiedAt, generatedPreview, file.PathFull)
		if err != nil {
			fmt.Printf("👁️❌ DB error updating cache preview of '%s', error: %s\n", file.Filename, err)
		}
	} else {
		_, err = appcache.DBCache.Query("INSERT INTO cache (pathfull, dateModification, preview) VALUES(?, ?, ?)", file.PathFull, file.ModifiedAt, generatedPreview)
		if err != nil {
			fmt.Printf("👁️❌ DB error creating cache preview of '%s', error: %s\n", file.Filename, err)
		}
	}

	if ACTIVE_JOBS != unixBeginning {
		fmt.Println("✅🛑 render was canceled. 3")
		return file
	}

	// If we were not cancelled
	if remaining == 0 {
		ACTIVE_JOBS = -1
	}

	fmt.Println("✅ render batch ended.")

	return file
}
