package appcache

import (
	"gyozora/data"
	"gyozora/models"

	_ "modernc.org/sqlite"
)

type CachePreview struct {
	PathFull         string `db:"pathfull"`
	DateModification int    `db:"dateModification"`
	Preview          string `db:"preview"`
}

func GetCachedPreview(file models.SysFile) (string, bool, error) {
	var cachedPreview CachePreview
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
