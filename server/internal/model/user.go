package model

import "time"

type User struct {
	IDUser        uint      `gorm:"column:id_user;primaryKey;autoIncrement" json:"id_user"`
	Role          string    `gorm:"column:role;type:varchar(10);not null;default:'USER';check:chk_users_role,role IN ('ADMIN','USER')" json:"role"`
	Username      string    `gorm:"column:username;type:varchar(50);not null;uniqueIndex" json:"username"`
	PasswordHash  string    `gorm:"column:password_hash;type:varchar(255);not null" json:"-"`
	NamaLengkap   string    `gorm:"column:nama_lengkap;type:varchar(100);not null" json:"nama_lengkap"`
	Email         string    `gorm:"column:email;type:varchar(100);not null;uniqueIndex" json:"email"`
	NoKeanggotaan string    `gorm:"column:no_keanggotaan;type:varchar(20);uniqueIndex" json:"no_keanggotaan"`
	NoIdentitas   string    `gorm:"column:no_identitas;type:varchar(30);index" json:"no_identitas"`
	Alamat        string    `gorm:"column:alamat;type:text" json:"alamat"`
	NoTelepon     string    `gorm:"column:no_telepon;type:varchar(20)" json:"no_telepon"`
	StatusAkun    string    `gorm:"column:status_akun;type:varchar(10);not null;default:'AKTIF';check:chk_users_status_akun,status_akun IN ('AKTIF','NONAKTIF','BLOKIR')" json:"status_akun"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	PeminjamanFisik   []PeminjamanFisik   `gorm:"foreignKey:IDUser;references:IDUser;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"peminjaman_fisik,omitempty"`
	PeminjamanDigital []PeminjamanDigital `gorm:"foreignKey:IDUser;references:IDUser;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"peminjaman_digital,omitempty"`
	RiwayatChatbot    []RiwayatChatbot    `gorm:"foreignKey:IDUser;references:IDUser;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"riwayat_chatbot,omitempty"`
}

func (User) TableName() string {
	return "users"
}
