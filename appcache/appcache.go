package appcache

import (
	"fmt"
	"gyozora/models"
	"os"
	"path/filepath"

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
	appDataDir, err := os.UserConfigDir()
	if err != nil {
		panic(err)
	}

	appdataRoaming := filepath.Join(appDataDir, "gyozora")
	targetDBPath := filepath.Join(appdataRoaming, "appcache.db")

	if _, err := os.Stat(appdataRoaming); os.IsNotExist(err) {
		os.Mkdir(appdataRoaming, 0700)
	}

	DBCache, err = sqlx.Open("sqlite", targetDBPath)
	if err != nil {
		fmt.Printf("Error starting appcache database. Error: %s\n", err)
		fmt.Println("❌ cache not connected.")
		return
	}

	cacheTable := `CREATE TABLE IF NOT EXISTS "cache" (
							"pathfull"	TEXT NOT NULL UNIQUE,
							"dateModification"	INTEGER NOT NULL,
							"preview"	BLOB NOT NULL,
							PRIMARY KEY("pathfull")
						);`

	_, err = DBCache.Exec(cacheTable)
	if err != nil {
		fmt.Printf("Error creating the cache table. Error: %s\n", err)
	}

	fmt.Println("✅ cache connected.")
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
