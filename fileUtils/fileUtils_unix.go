//go:build !windows
// +build !windows

package fileUtils

func CreatedAt(fpath string) int {
	return -1
}

func IsHidden(fpath string, filename string) bool {
	if filename[0] == '.' {
		return true
	}

	// TODO: Read hidden chflag

	return false
}
