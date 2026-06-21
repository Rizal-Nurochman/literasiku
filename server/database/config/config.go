package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	AppEnv string
	DB     DBConfig
}

type DBConfig struct {
	Host      string
	Port      string
	User      string
	Password  string
	Name      string
	Charset   string
	ParseTime string
	Loc       string
}

func LoadConfig() Config {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Printf("failed to load .env file: %v", err)
	}

	return Config{
		Port:   GetEnv("PORT", "8080"),
		AppEnv: GetEnv("APP_ENV", "development"),
		DB: DBConfig{
			Host:      GetEnv("DB_HOST", "localhost"),
			Port:      GetEnv("DB_PORT", "3306"),
			User:      GetEnv("DB_USER", "root"),
			Password:  GetEnv("DB_PASSWORD", "root"),
			Name:      GetEnv("DB_NAME", "literasiku_db"),
			Charset:   GetEnv("DB_CHARSET", "utf8mb4"),
			ParseTime: GetEnv("DB_PARSE_TIME", "True"),
			Loc:       GetEnv("DB_LOC", "Local"),
		},
	}
}

func GetEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
