package main

import (
	"context"
	"fmt"
	"gyozora/appcache"
	"gyozora/fileUtils"
	"gyozora/models"
	"gyozora/sysUtils"
	"io/ioutil"
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

func (a *App) ReadPath(currentpath string, path string) models.ReadPathResponse {
	// fmt.Println("########## FOLDER READ ##########")
	CURRENT_PATH = path
	dirFiles := make([]models.SysFile, 0)
	dirFolders := make([]models.SysFile, 0)
	breadcrumbs := make([]models.SysFile, 0)

	files, err := ioutil.ReadDir(path)
	if err != nil {
		return models.ReadPathResponse{Error: models.SimpleError{Status: true, Reason: "Check permissions."}}
	}

	// Load path content
	for _, file := range files {
		if file.IsDir() {
			dirFolders = append(dirFolders, fileUtils.GenerateSysFile(currentpath, filepath.Join(path, file.Name())))
		} else {
			dirFiles = append(dirFiles, fileUtils.GenerateSysFile(currentpath, filepath.Join(path, file.Name())))
		}
	}

	// Load path as breadcrumbs
	for _, folderPath := range GetPathFolders(path) {
		breadcrumbs = append(breadcrumbs, fileUtils.GenerateSysFile(currentpath, folderPath))
	}

	return models.ReadPathResponse{DirFiles: dirFiles, DirFolders: dirFolders, Breadcrumbs: breadcrumbs, Error: models.SimpleError{Status: false}}
}

func GetPathFolders(fpath string) []string {
	var pathes []string

	previousPath := ""
	curPath := fpath
	for curPath != "" && curPath != previousPath {
		pathes = append(pathes, curPath)
		previousPath = curPath
		curPath = filepath.Dir(curPath)
	}

	return pathes
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
		pinnedFolders = append(pinnedFolders, models.LeftBarElement{Name: "Applications", Type: "folderApplications", Path: filepath.Join(sysUtils.UserRoots()[0], "Applications")})
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

// File(s) actions
func (a *App) OpenFile(fpath string) models.ActionResponse {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", "", fpath)
	case "darwin":
		cmd = exec.Command("open", fpath)
	case "linux":
		cmd = exec.Command("xdg-open", fpath) // Test
	default:
		return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "Unsupported operating system."}}
	}

	fmt.Printf("Trying to execute the file with '%s'\n", cmd)
	err := cmd.Run()
	if err != nil {
		return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "Check permissions."}}
	}

	return models.ActionResponse{Error: models.SimpleError{Status: false}}
}

func (a *App) AddFile(path string, filename string, fileType string) models.ActionResponse {
	finalPath := filepath.Join(path, filename)

	if _, err := os.Stat(finalPath); err == nil {
		return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "File already exists."}}
	}
	fmt.Println("Type inputed:")
	fmt.Println(fileType)
	var file *os.File
	var err error
	if fileType == "folder" {
		err = os.Mkdir(finalPath, 0755) // TODO: perms
	} else {
		file, err = os.Create(finalPath)
	}
	if err != nil {
		valid := sysUtils.IsFilenameValid(filename)

		if !valid { // Uses an illegal character for a filename in that OS
			return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: fmt.Sprintf("A filename can't contain %s.", sysUtils.GetInvalidFilenameCharacters())}}
		} else {
			return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "Unexpected error while creating the new file."}}
		}
	}
	file.Close()

	createdFile := fileUtils.GenerateSysFile(path, filepath.Join(path, filename))

	return models.ActionResponse{Error: models.SimpleError{Status: false}, File: createdFile}
}

func (a *App) CutFile_s(fpaths []string) {
	fmt.Println("TBD -1")
}
func (a *App) CopyFile_s(fpaths []string) {
	fmt.Println("TBD -1")
}

func (a *App) PasteFolder(srcFolder models.SysFile, tgtPath string, isBase bool) models.PastFileResponse {
	srcPath := srcFolder.PathFull
	tgtPathFinal := filepath.Join(tgtPath, srcFolder.Filename)

	_, err := os.Stat(srcPath)
	if err != nil { // If source file or folder doesn't exists, ignore and return not completed
		fmt.Println(err)
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: err.Error()}}
	}

	_, err = os.Stat(tgtPath)
	if err != nil { // If target path doesn't exist, ignore and return not completed
		fmt.Println(err)
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: err.Error()}}
	}

	//Check if pasting location exist a file with that filename
	_, err = os.Stat(tgtPathFinal)
	if err == nil { // Exists with that name, ignore and return not completed
		fmt.Println("File with that filename already exists")
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: "File already exists"}}
	}

	// Final path? Where the folder/file would be:
	finalPath := ""
	fullFinalPath := ""
	finalPath = filepath.Dir(filepath.Join(tgtPath, srcFolder.Filename)) // TODO: Revise this

	if !isBase {
		relPath := strings.Replace(srcFolder.PathRelativeFull, "..", "", 1)
		relPath = strings.Replace(relPath, string(filepath.Separator), "", 1)
		finalPath = filepath.Dir(filepath.Join(tgtPath, relPath))
	}

	//Check exists folder
	//Then if not:
	fullFinalPath = filepath.Join(finalPath, srcFolder.Filename)
	// fmt.Printf("Execute os.Mkdir(%s, 0644)\n", fullFinalPath)
	err = os.Mkdir(fullFinalPath, 0644)
	if err != nil {
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: err.Error()}}
	}

	pastedFile := fileUtils.GenerateSysFile(finalPath, fullFinalPath)
	pastedFile.Preview = srcFolder.Preview

	return models.PastFileResponse{File: pastedFile, Error: models.SimpleError{Status: false}}
}

func (a *App) PasteFile(srcFile models.SysFile, tgtPath string, isBase bool) models.PastFileResponse { // TODO: Add previews to cache. Return error details
	srcPath := srcFile.PathFull

	finalPath := ""
	fullFinalPath := ""
	finalPath = filepath.Dir(filepath.Join(tgtPath, srcFile.Filename)) // TODO: Revise this
	if !isBase {
		relPath := strings.Replace(srcFile.PathRelativeFull, "..", "", 1)
		relPath = strings.Replace(relPath, string(filepath.Separator), "", 1)
		finalPath = filepath.Dir(filepath.Join(tgtPath, relPath))
	}
	fullFinalPath = filepath.Join(finalPath, srcFile.Filename)

	_, err := os.Stat(srcPath)
	if err != nil { // If source file or folder doesn't exists, ignore and return not completed
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: err.Error()}}
	}

	_, err = os.Stat(tgtPath)
	if err != nil { // If target path doesn't exist, ignore and return not completed
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: err.Error()}}
	}

	//Check if pasting location exist a file with that filename
	_, err = os.Stat(fullFinalPath)
	if err == nil { // Exists with that name, ignore and return not completed
		fmt.Println("File with that filename already exists")
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: "File already exists"}}
	}

	// Final path? Where the folder/file would be:

	content, err := os.ReadFile(srcPath)
	if err != nil {
		return models.PastFileResponse{Error: models.SimpleError{Status: true, Reason: err.Error()}}
	}

	err = os.WriteFile(fullFinalPath, content, 0644) // TODO: Perms
	if err != nil {
		return models.PastFileResponse{Error: models.SimpleError{Status: true}}
	}

	pastedFile := fileUtils.GenerateSysFile(finalPath, fullFinalPath)
	pastedFile.Preview = srcFile.Preview

	return models.PastFileResponse{File: pastedFile, Error: models.SimpleError{Status: false}}
}
func (a *App) RenameFile(file models.SysFile, newFilename string) models.ActionResponse { // TODO: Update cache DB
	newPath := filepath.Join(file.Path, newFilename)

	if _, err := os.Stat(newPath); err == nil {
		return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "File already exists."}}
	}

	err := os.Rename(file.PathFull, newPath)
	if err != nil {
		fmt.Println(err)
		return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "Unexpected error."}}
	}

	renamedFile := fileUtils.GenerateSysFile(file.Path, filepath.Join(file.Path, newFilename)) // Generate a new sys file (to handle renaming to different extension)

	if file.Extension == renamedFile.Extension {
		renamedFile.Preview = file.Preview
	}

	return models.ActionResponse{Error: models.SimpleError{Status: false}, File: renamedFile}
}
func (a *App) DeleteFile_s(files []models.SysFile) models.ActionResponse {
	allDeleted := true // TODO: Return what files haven't been deleted.
	for _, file := range files {
		err := os.RemoveAll(file.PathFull)
		if err != nil {
			fmt.Printf("Error deleting the file '%s'\n", file.PathFull)
			allDeleted = false
		}
	}
	if !allDeleted {
		return models.ActionResponse{Error: models.SimpleError{Status: true, Reason: "Some files could not be deleted."}}
	}

	return models.ActionResponse{Error: models.SimpleError{Status: false}}
}
func (a *App) PropertiesFile(fpath string) models.SysFile {
	return fileUtils.GenerateSysFile(fpath, fpath)
}
