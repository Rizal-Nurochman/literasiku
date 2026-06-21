package config

import (
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	AppEnv string
	DB     DBConfig
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	TimeZone string
}

func LoadConfig() Config {
	if err := loadEnv(); err != nil {
		log.Printf("failed to load .env file: %v", err)
	}

	cfg := Config{
		Port:   GetEnv("PORT", "8080"),
		AppEnv: GetEnv("APP_ENV", "development"),
	}

	// Prioritaskan DATABASE_URL jika ada (untuk Vercel + Neon/Supabase)
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		parsed, err := parseDatabaseURL(dbURL)
		if err != nil {
			log.Printf("failed to parse DATABASE_URL: %v, falling back to individual env vars", err)
			cfg.DB = loadDBConfigFromEnv()
		} else {
			cfg.DB = parsed
		}
	} else {
		cfg.DB = loadDBConfigFromEnv()
	}

	log.Printf("db config: host=%s port=%s user=%s dbname=%s sslmode=%s timezone=%s",
		cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Name, cfg.DB.SSLMode, cfg.DB.TimeZone)

	return cfg
}

func loadDBConfigFromEnv() DBConfig {
	return DBConfig{
		Host:     GetEnv("DB_HOST", "localhost"),
		Port:     GetEnv("DB_PORT", "5432"),
		User:     GetEnv("DB_USER", "postgres"),
		Password: GetEnv("DB_PASSWORD", ""),
		Name:     GetEnv("DB_NAME", "literasiku_db"),
		SSLMode:  GetEnv("DB_SSLMODE", "disable"),
		TimeZone: GetEnv("DB_TIMEZONE", "Asia/Jakarta"),
	}
}

// parseDatabaseURL parses a PostgreSQL connection URL into DBConfig.
// Format: postgres://user:password@host:port/dbname?sslmode=require
func parseDatabaseURL(rawURL string) (DBConfig, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return DBConfig{}, err
	}

	password, _ := u.User.Password()

	host := u.Hostname()
	port := u.Port()
	if port == "" {
		port = "5432"
	}

	dbName := strings.TrimPrefix(u.Path, "/")

	sslMode := u.Query().Get("sslmode")
	if sslMode == "" {
		sslMode = "require" // default require untuk cloud providers
	}

	return DBConfig{
		Host:     host,
		Port:     port,
		User:     u.User.Username(),
		Password: password,
		Name:     dbName,
		SSLMode:  sslMode,
		TimeZone: GetEnv("DB_TIMEZONE", "Asia/Jakarta"),
	}, nil
}

func loadEnv() error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	candidates := []string{
		filepath.Join(cwd, ".env"),
		filepath.Join(cwd, "..", ".env"),
		filepath.Join(cwd, "../..", ".env"),
	}

	var lastErr error
	for _, path := range candidates {
		if _, statErr := os.Stat(path); statErr != nil {
			lastErr = statErr
			continue
		}
		if err := godotenv.Load(path); err != nil {
			lastErr = err
			continue
		}
		log.Printf("loaded env file: %s", path)
		return nil
	}

	if lastErr == nil {
		lastErr = os.ErrNotExist
	}
	return lastErr
}

func GetEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

