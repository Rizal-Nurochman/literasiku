package model

import "time"

type FilePDF struct {
	IDFile        uint      `gorm:"column:id_file;primaryKey;autoIncrement" json:"id_file"`
	IDBuku        uint      `gorm:"column:id_buku;not null;index" json:"id_buku"`
	PathFile      string    `gorm:"column:path_file;type:varchar(500);not null" json:"path_file"`
	NamaFile      string    `gorm:"column:nama_file;type:varchar(255);not null" json:"nama_file"`
	UkuranFile    int64     `gorm:"column:ukuran_file;type:bigint;not null;default:0" json:"ukuran_file"`
	TanggalUnggah time.Time `gorm:"column:tanggal_unggah;not null" json:"tanggal_unggah"`
	Status        string    `gorm:"column:status;type:varchar(10);not null;default:'AKTIF';check:chk_file_pdf_status,status IN ('AKTIF','NONAKTIF')" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Buku Buku `gorm:"foreignKey:IDBuku;references:IDBuku;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"buku,omitempty"`
}

func (FilePDF) TableName() string {
	return "file_pdf"
}
