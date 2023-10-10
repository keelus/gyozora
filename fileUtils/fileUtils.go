package fileUtils

import "strings"

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

	switch extension {
	case ".png", ".jpg", ".jpeg", ".webp", ".gif":
		return "fileImage"
	case ".mp3", ".wav", ".flac", ".aac", ".ogg":
		return "fileAudio"
	case ".mp4", ".avi", ".mkv", ".mov", ".wmv":
		return "fileVideo"
	case ".zip", ".rar", ".7z", ".tar", ".gz", ".tar.gz":
		return "fileCompressed"
	case ".exe", ".bin", ".app", ".msi", ".jar":
		return "fileExecutable"
	case ".sh", ".bat", ".vbs", ".ps1":
		return "fileExecutableScript"
	case ".ttf", ".otf", ".ps", ".woff", ".woff2":
		return "fileFont"
	case ".pdf":
		return "filePdf"
	case ".js", ".ts", ".jsx", ".tsx", ".html", ".css":
	case ".sass", ".scss", ".svelte":
	case ".java", ".class", ".py", ".c", ".cpp", ".h":
	case ".php", ".rb", ".go", ".rs", ".swift", ".kt":
	case ".cs", ".xml":
	case ".md":
		return "fileCode"
	case ".json":
		return "fileJson"
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
