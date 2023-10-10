package fileUtils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

func GetFileType(filename string, extension string, isFolder bool) string {
	// Edge cases:
	switch strings.ToLower(filename) {
	case "desktop":
		return "folderDesktop"
	case "downloads":
		return "folderDownloads"
	case "documents":
		return "folderDocuments"
	case "pictures":
		return "folderPictures"
	case "music":
		return "folderMusic"
	}
	if isFolder {
		return "folder"
	}

	ftype := fileTypeMap[extension]
	if ftype != "" {
		return ftype
	}
	return "file"
}

func IsHidden(fpath string) bool {
	return false
}
func CreatedAt(fpath string) int {
	return 0
}
func ModifiedAt(fpath string) int {
	return 0
}

var fileTypeMap map[string]string

func LoadJSON() {
	jsonUbi := "./fileUtils/extensionData.json"

	jsonContent, err := ioutil.ReadFile(jsonUbi)
	if err != nil {
		fmt.Printf("Error reading file type json:%s\n", err)
		os.Exit(1)
	}

	err = json.Unmarshal([]byte(jsonContent), &fileTypeMap)
	if err != nil {
		fmt.Printf("Error reading file type json:%s\n", err)
		os.Exit(1)
	}
	fmt.Println("👍 File type JSON loaded")
}
