package model

import "time"

type Buku struct {
	IDBuku          uint      `gorm:"column:id_buku;primaryKey;autoIncrement" json:"id_buku"`
	IDKategori      uint      `gorm:"column:id_kategori;not null;index" json:"id_kategori"`
	Judul           string    `gorm:"column:judul;type:varchar(255);not null;index" json:"judul"`
	Pengarang       string    `gorm:"column:pengarang;type:varchar(100);not null;index" json:"pengarang"`
	Penerbit        string    `gorm:"column:penerbit;type:varchar(100)" json:"penerbit"`
	TahunTerbit     int       `gorm:"column:tahun_terbit;type:smallint" json:"tahun_terbit"`
	ISBN            string    `gorm:"column:isbn;type:varchar(20);uniqueIndex" json:"isbn"`
	StokFisik       int       `gorm:"column:stok_fisik;not null;default:0" json:"stok_fisik"`
	TersediaFisik   bool      `gorm:"column:tersedia_fisik;not null;default:true" json:"tersedia_fisik"`
	TersediaDigital bool      `gorm:"column:tersedia_digital;not null;default:false" json:"tersedia_digital"`
	StatusBuku      string    `gorm:"column:status_buku;type:varchar(10);not null;default:'AKTIF';check:chk_buku_status_buku,status_buku IN ('AKTIF','NONAKTIF','RUSAK','HILANG')" json:"status_buku"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	Kategori          KategoriBuku        `gorm:"foreignKey:IDKategori;references:IDKategori;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"kategori,omitempty"`
	FilePDF           []FilePDF           `gorm:"foreignKey:IDBuku;references:IDBuku;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"file_pdf,omitempty"`
	PeminjamanFisik   []PeminjamanFisik   `gorm:"foreignKey:IDBuku;references:IDBuku;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"peminjaman_fisik,omitempty"`
	PeminjamanDigital []PeminjamanDigital `gorm:"foreignKey:IDBuku;references:IDBuku;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"peminjaman_digital,omitempty"`
}

func (Buku) TableName() string {
	return "buku"
}
