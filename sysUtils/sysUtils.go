package sysUtils

import (
	"fmt"
	"os"
	"os/user"
	"path"
	"runtime"
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
	var disks []string
	if runtime.GOOS != "windows" {
		fmt.Println("Only windows supported for now.")
		os.Exit(1)
	}

	for i := 'A'; i <= 'Z'; i++ {
		disk := string(i) + ":\\"
		_, err := os.Stat(disk)
		if err == nil {
			disks = append(disks, disk)
		}
	}

	return disks
}

func CacheDir() string {
	if runtime.GOOS != "windows" {
		fmt.Println("Only windows supported for now.")
		os.Exit(1)
	}

	cacheDir, _ := os.UserCacheDir()
	return path.Join(cacheDir, "kyozora")
}
