package entities

import "time"

type DigitalLoan struct {
	ID          uint   `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID      uint   `gorm:"column:user_id;not null;index" json:"user_id"`
	BookID      uint   `gorm:"column:book_id;not null;index" json:"book_id"`
	StartDate   time.Time `gorm:"column:start_date;not null" json:"start_date"`
	EndDate     time.Time `gorm:"column:end_date;not null" json:"end_date"`
	AccessStatus string `gorm:"column:access_status;type:varchar(10);not null;default:'ACTIVE';check:chk_digital_loan_access_status,access_status IN ('ACTIVE','EXPIRED','REVOKED')" json:"access_status"`
	Timestamp

	User          User         `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	Book          Book         `gorm:"foreignKey:BookID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"book,omitempty"`
	ChatHistory   []ChatHistory `gorm:"foreignKey:DigitalLoanID;references:ID" json:"chat_history,omitempty"`
}

func (DigitalLoan) TableName() string {
	return "digital_loans"
}
