package entities

import "time"

type File struct {
	ID         uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	BookID     uint      `gorm:"column:book_id;not null;index" json:"book_id"`
	FilePath   string    `gorm:"column:file_path;type:varchar(500);not null" json:"file_path"`
	FileName   string    `gorm:"column:file_name;type:varchar(255);not null" json:"file_name"`
	FileSize   int64     `gorm:"column:file_size;type:bigint;not null;default:0" json:"file_size"`
	UploadDate time.Time `gorm:"column:upload_date;not null" json:"upload_date"`
	Status     string    `gorm:"column:status;type:varchar(10);not null;default:'ACTIVE';check:chk_file_status,status IN ('ACTIVE','INACTIVE')" json:"status"`
	Timestamp

	Book Book `gorm:"foreignKey:BookID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"book,omitempty"`
}

func (File) TableName() string {
	return "files"
}
