package entities

import "time"

type PeminjamanFisik struct {
	IDPeminjamanFisik uint       `gorm:"column:id_peminjaman_fisik;primaryKey;autoIncrement" json:"id_peminjaman_fisik"`
	IDUser            uint       `gorm:"column:id_user;not null;index" json:"id_user"`
	IDBuku            uint       `gorm:"column:id_buku;not null;index" json:"id_buku"`
	TanggalPinjam     time.Time  `gorm:"column:tanggal_pinjam;type:date;not null" json:"tanggal_pinjam"`
	TanggalJatuhTempo time.Time  `gorm:"column:tanggal_jatuh_tempo;type:date;not null" json:"tanggal_jatuh_tempo"`
	TanggalKembali    *time.Time `gorm:"column:tanggal_kembali;type:date" json:"tanggal_kembali"`
	Status            string     `gorm:"column:status;type:varchar(15);not null;default:'DIPINJAM';check:chk_peminjaman_fisik_status,status IN ('DIPINJAM','DIKEMBALIKAN','TERLAMBAT','HILANG')" json:"status"`
	JumlahDenda       float64    `gorm:"column:jumlah_denda;type:decimal(10,2);not null;default:0" json:"jumlah_denda"`
	StatusDenda       string     `gorm:"column:status_denda;type:varchar(15);not null;default:'TIDAK_ADA';check:chk_peminjaman_fisik_status_denda,status_denda IN ('TIDAK_ADA','BELUM_LUNAS','LUNAS')" json:"status_denda"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`

	User User `gorm:"foreignKey:IDUser;references:IDUser;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	Buku Buku `gorm:"foreignKey:IDBuku;references:IDBuku;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"buku,omitempty"`
}

func (PeminjamanFisik) TableName() string {
	return "peminjaman_fisik"
}
