package sysUtils

import (
	"fmt"
	"os"
	"os/user"
	"path"
	"runtime"
	"strings"
)

func UserHomedir() string {
	_user, err := user.Current()
	if err != nil {
		fmt.Println("ERROR getting user")
		os.Exit(1)
	}

	return _user.HomeDir
}

func UserRoots() []string {
	if runtime.GOOS == "windows" {
		var disks []string
		for i := 'A'; i <= 'Z'; i++ {
			disk := string(i) + ":\\"
			_, err := os.Stat(disk)
			if err == nil {
				disks = append(disks, disk)
			}
		}

		return disks
	} else {
		return []string{"/"}
	}
}

func CacheDir() string {
	if runtime.GOOS == "windows" {
		cacheDir, _ := os.UserCacheDir()
		return path.Join(cacheDir, "gyozora")
	} else {
		return "-1"
	}

}

func IsFilenameValid(filename string) bool {
	if filename == "" || filename == "." || filename == ".." {
		return false
	}

	invalidChars := GetInvalidFilenameCharacters()

	for _, char := range invalidChars {
		if strings.ContainsRune(filename, char) {
			return false
		}
	}

	return true
}

func GetInvalidFilenameCharacters() string {
	if runtime.GOOS == "windows" {
		return "<>:\"/\\|?*"
	}
	return "/"

}
