//go:build windows
// +build windows

package fileUtils

import (
	"os"
	"time"

	"golang.org/x/sys/windows"
)

func CreatedAt(fpath string) int {
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
