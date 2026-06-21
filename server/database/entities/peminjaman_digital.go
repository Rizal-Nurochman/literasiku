package entities

import "time"

type PeminjamanDigital struct {
	IDPeminjamanDigital uint      `gorm:"column:id_peminjaman_digital;primaryKey;autoIncrement" json:"id_peminjaman_digital"`
	IDUser              uint      `gorm:"column:id_user;not null;index" json:"id_user"`
	IDBuku              uint      `gorm:"column:id_buku;not null;index" json:"id_buku"`
	TanggalMulai        time.Time `gorm:"column:tanggal_mulai;not null" json:"tanggal_mulai"`
	TanggalAkhir        time.Time `gorm:"column:tanggal_akhir;not null" json:"tanggal_akhir"`
	StatusAkses         string    `gorm:"column:status_akses;type:varchar(10);not null;default:'AKTIF';check:chk_peminjaman_digital_status_akses,status_akses IN ('AKTIF','EXPIRED','DICABUT')" json:"status_akses"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`

	User           User             `gorm:"foreignKey:IDUser;references:IDUser;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	Buku           Buku             `gorm:"foreignKey:IDBuku;references:IDBuku;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"buku,omitempty"`
	RiwayatChatbot []RiwayatChatbot `gorm:"foreignKey:IDPeminjamanDigital;references:IDPeminjamanDigital;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"riwayat_chatbot,omitempty"`
}

func (PeminjamanDigital) TableName() string {
	return "peminjaman_digital"
}
