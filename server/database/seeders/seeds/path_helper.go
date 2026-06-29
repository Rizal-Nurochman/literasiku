package seeds

import (
	"path/filepath"
	"runtime"
)

// jsonDir returns the absolute path to the seeders/json directory.
// It uses runtime.Caller to locate the source file at compile-time,
// so it works regardless of the working directory at execution time.
func jsonDir() string {
	_, currentFile, _, _ := runtime.Caller(0)
	// currentFile = .../database/seeders/seeds/path_helper.go
	// Go up one level to .../database/seeders/, then into json/
	return filepath.Join(filepath.Dir(currentFile), "..", "json")
}

// jsonPath returns the absolute path to a specific JSON seed file.
func jsonPath(filename string) string {
	return filepath.Join(jsonDir(), filename)
}
