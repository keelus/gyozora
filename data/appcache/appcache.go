package appcache

import (
	"fmt"
	"gyozora/data"
	"gyozora/models"
	"path/filepath"
	"strings"

	_ "modernc.org/sqlite"
)

func GetCachedPreview(file models.SysFile) (string, bool, error) {
	if !UsingCache() {
		fmt.Println("Not using cache. Ignoring.")
		return "", false, nil
	}
	var cachedPreview models.CachePreview
	var isLatest bool

	isLatest = true
	err := data.DataDB.QueryRowx("SELECT * FROM cache WHERE pathfull=?", file.PathFull).StructScan(&cachedPreview)
	if err != nil {
		return "", false, err
	}

	// If we got the catched image, let's check if is the version that we saved:
	isLatest = file.ModifiedAt == cachedPreview.DateModification

	return cachedPreview.Preview, isLatest, nil
}

func AddOrUpdatePreview(file models.SysFile, preview string) {
	if !UsingCache() {
		fmt.Println("Not using cache. Ignoring.")
		return
	}
	data.DataDB.Query(`INSERT INTO cache (pathfull, dateModification, preview) VALUES(?, ?, ?) 
			ON CONFLICT(pathfull) DO UPDATE SET dateModification=excluded.dateModification, preview=excluded.preview`,
		file.PathFull, file.ModifiedAt, preview)
}

func MovePreview(fileOld models.SysFile, fileNew models.SysFile) {
	if !UsingCache() {
		fmt.Println("Not using cache. Ignoring.")
		return
	}
	_, _, err := GetCachedPreview(fileNew)
	if err == nil { // The path we renamed to existed earlier. Delete this one and add the new one. This could happen if renamed outside gyozora.
		DeletePreview(fileNew)
	}

	data.DataDB.Query("UPDATE cache SET pathfull=? WHERE pathfull=?", fileNew.PathFull, fileOld.PathFull)
}

func DeletePreview(file models.SysFile) {
	if !UsingCache() {
		fmt.Println("Not using cache. Ignoring.")
		return
	}

	data.DataDB.Query("DELETE FROM cache WHERE pathfull=?", file.PathFull)
}

func DeletePreviewsInside(baseFile models.SysFile) {
	var previewPathes []string
	data.DataDB.Select(&previewPathes, "SELECT pathfull FROM cache")

	insidePathes := make([]string, 0)

	baseParts := strings.Split(baseFile.PathFull, string(filepath.Separator))
	for _, path := range previewPathes {
		if len(path) <= len(baseFile.PathFull) { // Subdirectory path will always be greater than parent directory path
			continue
		}

		parts := strings.Split(path, string(filepath.Separator))

		matchingBases := true
		for i := 0; i < len(baseParts); i++ {
			if baseParts[i] != parts[i] {
				matchingBases = false
				break
			}
		}

		if matchingBases {
			insidePathes = append(insidePathes, path)
		}

	}

	for _, insidePath := range insidePathes {
		DeletePreview(models.SysFile{PathFull: insidePath})
	}
}

func UsingCache() bool {
	value := "null"
	data.DataDB.QueryRowx("SELECT value FROM config WHERE name='useCache'").Scan(&value)

	return !(value == "false") // Anything but false will be true
}
