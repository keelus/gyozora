package data

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

var DataDB *sqlx.DB

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

	DataDB, err = sqlx.Open("sqlite", targetDBPath)
	if err != nil {
		fmt.Printf("Error starting database. Error: %s\n", err)
		fmt.Println("❌ cache not connected.")
		return
	}

	cacheTable := `CREATE TABLE IF NOT EXISTS "cache" (
							"pathfull"	TEXT NOT NULL UNIQUE,
							"dateModification"	INTEGER NOT NULL,
							"preview"	BLOB NOT NULL,
							PRIMARY KEY("pathfull")
						);`

	configTable := `CREATE TABLE "config" (
							"name"	TEXT NOT NULL UNIQUE,
							"value"	TEXT NOT NULL,
							PRIMARY KEY("name")
						);`

	_, err = DataDB.Exec(cacheTable)
	if err != nil {
		fmt.Printf("Error creating the cache table. Error: %s\n", err)
	}
	_, err = DataDB.Exec(configTable)
	if err != nil {
		fmt.Printf("Error creating the config table. Error: %s\n", err)
	}

	fmt.Println("✅ cache connected.")
}
