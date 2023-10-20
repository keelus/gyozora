//go:build !windows
// +build !windows

package fileUtils

func CreatedAt(fpath string) int {
	return -1
}
