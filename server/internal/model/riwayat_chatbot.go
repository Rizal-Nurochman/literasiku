package model

import "time"

type RiwayatChatbot struct {
	IDRiwayat           uint      `gorm:"column:id_riwayat;primaryKey;autoIncrement" json:"id_riwayat"`
	IDUser              uint      `gorm:"column:id_user;not null;index" json:"id_user"`
	IDPeminjamanDigital *uint     `gorm:"column:id_peminjaman_digital;index" json:"id_peminjaman_digital"`
	Pertanyaan          string    `gorm:"column:pertanyaan;type:text;not null" json:"pertanyaan"`
	KonteksBuku         string    `gorm:"column:konteks_buku;type:text" json:"konteks_buku"`
	Jawaban             string    `gorm:"column:jawaban;type:text;not null" json:"jawaban"`
	WaktuInteraksi      time.Time `gorm:"column:waktu_interaksi;not null" json:"waktu_interaksi"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`

	User              User               `gorm:"foreignKey:IDUser;references:IDUser;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	PeminjamanDigital *PeminjamanDigital `gorm:"foreignKey:IDPeminjamanDigital;references:IDPeminjamanDigital;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"peminjaman_digital,omitempty"`
}

func (RiwayatChatbot) TableName() string {
	return "riwayat_chatbot"
}
