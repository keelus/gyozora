//go:build windows
// +build windows

package fileUtils

import (
	"fmt"
	"os"
	"runtime"
	"time"

	"golang.org/x/sys/windows"
)

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
