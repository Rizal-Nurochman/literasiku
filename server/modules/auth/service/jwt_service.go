package service

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTService interface {
	GenerateToken(userID uint, role string) (string, error)
	ValidateToken(token string) (*jwt.Token, error)
	GetUserIDByToken(token string) (uint, error)
	GetRoleByToken(token string) (string, error)
}

type jwtCustomClaim struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type jwtService struct {
	secretKey string
	issuer    string
}

func NewJWTService() JWTService {
	return &jwtService{
		secretKey: getSecretKey(),
		issuer:    "literasiku",
	}
}

func getSecretKey() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "literasiku-secret-key"
	}
	return secret
}

func (j *jwtService) GenerateToken(userID uint, role string) (string, error) {
	claims := jwtCustomClaim{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", fmt.Errorf("sign token: %w", err)
	}
	return signed, nil
}

func (j *jwtService) parseToken(t *jwt.Token) (any, error) {
	if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
	}
	return []byte(j.secretKey), nil
}

func (j *jwtService) ValidateToken(token string) (*jwt.Token, error) {
	parsed, err := jwt.Parse(token, j.parseToken)
	if err != nil {
		return nil, err
	}
	if !parsed.Valid {
		return nil, errors.New("token is not valid")
	}
	return parsed, nil
}

func (j *jwtService) GetUserIDByToken(token string) (uint, error) {
	parsed, err := j.ValidateToken(token)
	if err != nil {
		return 0, err
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims type")
	}
	idFloat, ok := claims["user_id"].(float64)
	if !ok {
		return 0, errors.New("user_id claim not found")
	}
	return uint(idFloat), nil
}

func (j *jwtService) GetRoleByToken(token string) (string, error) {
	parsed, err := j.ValidateToken(token)
	if err != nil {
		return "", err
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid claims type")
	}
	role, ok := claims["role"].(string)
	if !ok {
		return "", errors.New("role claim not found")
	}
	return role, nil
}
