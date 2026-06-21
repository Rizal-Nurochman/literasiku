package entities

import "time"

type KategoriBuku struct {
	IDKategori   uint      `gorm:"column:id_kategori;primaryKey;autoIncrement" json:"id_kategori"`
	NamaKategori string    `gorm:"column:nama_kategori;type:varchar(50);not null;uniqueIndex" json:"nama_kategori"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Buku []Buku `gorm:"foreignKey:IDKategori;references:IDKategori;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"buku,omitempty"`
}

func (KategoriBuku) TableName() string {
	return "kategori_buku"
}
