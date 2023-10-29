package appcache

import (
	"gyozora/data"
	"gyozora/models"

	_ "modernc.org/sqlite"
)

func GetCachedPreview(file models.SysFile) (string, bool, error) {
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
