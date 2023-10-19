package appcache

import (
	"fmt"
	"gyozora/models"
	"os"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

var DBCache *sqlx.DB

type CachePreview struct {
	PathFull         string `db:"pathfull"`
	DateModification int    `db:"dateModification"`
	Preview          string `db:"preview"`
}

func ConnectDB() {
	AbsPath, err := os.Getwd() // TODO: This
	if err != nil {
		fmt.Println("Error getting absolute path for DB connection.")
		os.Exit(-1)
	}

	DBPath := AbsPath + "/appcache/appcache.db"

	DBCache, err = sqlx.Open("sqlite", DBPath)
	if err != nil {
		fmt.Printf("Error starting appcache database. Error: %s\n", err)
		os.Exit(-1)
	}
}

func GetCachedPreview(file models.SysFile) (string, bool, error) {
	var cachedPreview CachePreview
	var isLatest bool

	isLatest = true
	err := DBCache.QueryRowx("SELECT * FROM cache WHERE pathfull=?", file.PathFull).StructScan(&cachedPreview)
	if err != nil {
		return "", false, err
	}

	// If we got the catched image, let's check if is the version that we saved:
	isLatest = file.ModifiedAt == cachedPreview.DateModification

	return cachedPreview.Preview, isLatest, nil
}
