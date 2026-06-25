package entities

import "time"

type ChatHistory struct {
	ID              uint   `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID          uint   `gorm:"column:user_id;not null;index" json:"user_id"`
	DigitalLoanID   *uint  `gorm:"column:digital_loan_id;index" json:"digital_loan_id"`
	Question        string `gorm:"column:question;type:text;not null" json:"question"`
	BookContext     string `gorm:"column:book_context;type:text" json:"book_context"`
	Answer          string `gorm:"column:answer;type:text;not null" json:"answer"`
	InteractionTime time.Time `gorm:"column:interaction_time;not null" json:"interaction_time"`
	Timestamp

	User          User         `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	DigitalLoan   *DigitalLoan `gorm:"foreignKey:DigitalLoanID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"digital_loan,omitempty"`
}

func (ChatHistory) TableName() string {
	return "chat_histories"
}
