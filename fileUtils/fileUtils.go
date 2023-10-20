package fileUtils

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io/ioutil"
	"math"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/nfnt/resize"
	"github.com/srwiley/oksvg"
	"github.com/srwiley/rasterx"
	"golang.org/x/image/webp"
	"golang.org/x/sys/windows"
)

const (
	PREVIEW_MAX_SIZE = 90
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
	if runtime.GOOS != "windows" {
		fmt.Println("Only windows supported for now.")
		os.Exit(1)
	}

	file, err := os.Open(fpath)
	if err != nil {
		return -1
	}
	defer file.Close()

	fileHandle := file.Fd()

	var fileInfo windows.ByHandleFileInformation
	err = windows.GetFileInformationByHandle(windows.Handle(fileHandle), &fileInfo)
	if err != nil {
		return -1
	}

	creationTime := time.Unix(0, fileInfo.CreationTime.Nanoseconds()).Unix()

	return int(creationTime)
}
func ModifiedAt(fpath string) int {
	fileInfo, err := os.Stat(fpath)
	if err != nil {
		return -1
	}

	return int(fileInfo.ModTime().Unix())
}

var fileTypeMap map[string]string

func LoadJSON() {
	jsonUbi := "./data/extensionData.json"

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

// TODO FILE PREVIEWS:
// VIDEO
//
//	.mp4
//	.avi
//	.mkv
//	.mov
//	.wmv
//
// AUDIO
//
//	Album icons
//
// EXECUTABLES
//
//	.exe (win)
//	.app (macOS)
//
// SHORTCUTS
//
//	.lnk (win)
//	.alias (macOS)
//
// OTHERS
//
//	.docx
//	.pptx
func GetImagePreview(fpath string, extension string) string {
	content, err := os.Open(fpath)
	if err != nil {
		fmt.Printf("⚠️ Error opening the image '%s'\n", fpath)
		return ""
	}
	defer content.Close()

	var imageDecoded image.Image

	if extension == ".webp" {
		imageDecoded, err = webp.Decode(content)
		if err != nil {
			fmt.Printf("⚠️ Error decoding the WEBPP '%s'", fpath)
			return ""
		}
	} else if extension == ".svg" {
		icon, _ := oksvg.ReadIconStream(content)
		icon.SetTarget(0, 0, float64(PREVIEW_MAX_SIZE), float64(PREVIEW_MAX_SIZE))
		rgba := image.NewRGBA(image.Rect(0, 0, PREVIEW_MAX_SIZE, PREVIEW_MAX_SIZE))
		icon.Draw(rasterx.NewDasher(PREVIEW_MAX_SIZE, PREVIEW_MAX_SIZE, rasterx.NewScannerGV(PREVIEW_MAX_SIZE, PREVIEW_MAX_SIZE, rgba, rgba.Bounds())), 1)

		imageDecoded = rgba
	} else {
		imageDecoded, _, err = image.Decode(content)
		if err != nil {
			fmt.Printf("⚠️ Error decoding the image '%s'", fpath)
			return ""
		}
	}

	maxSize := float64(PREVIEW_MAX_SIZE)

	width := float64(imageDecoded.Bounds().Dx())
	height := float64(imageDecoded.Bounds().Dy())
	aspectRatio := width / height

	var newWidth, newHeight uint
	if aspectRatio > 1 {
		newWidth = uint(maxSize)
		newHeight = uint(math.Round(float64(newWidth) / aspectRatio))
	} else {
		newHeight = uint(maxSize)
		newWidth = uint(math.Round(float64(newHeight) * aspectRatio))
	}

	// Resize the input image to create a preview
	previewImage := resize.Resize(uint(newWidth), uint(newHeight), imageDecoded, resize.Lanczos3)

	var buffer bytes.Buffer

	if extension == ".png" || extension == ".svg" {
		err = png.Encode(&buffer, previewImage)
		if err != nil {
			fmt.Println("⚠️ Error encoding preview image:", err)
			return ""
		}
	} else if extension == ".jpg" || extension == ".jpeg" || extension == ".webp" {
		err = jpeg.Encode(&buffer, previewImage, nil)
		if err != nil {
			fmt.Println("⚠️ Error encoding preview image as JPG:", err)
			return ""
		}
	} else if extension == ".gif" {
		err = gif.Encode(&buffer, previewImage, nil)
		if err != nil {
			fmt.Println("⚠️ Error encoding preview image as GIF:", err)
			return ""
		}
	}

	previewBytes := buffer.Bytes()
	previewStringB64 := base64.StdEncoding.EncodeToString(previewBytes)
	return previewStringB64

}
