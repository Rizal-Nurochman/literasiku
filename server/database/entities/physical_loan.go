package entities

import "time"

type PhysicalLoan struct {
	ID              uint       `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID          uint       `gorm:"column:user_id;not null;index" json:"user_id"`
	BookID          uint       `gorm:"column:book_id;not null;index" json:"book_id"`
	BorrowDate      time.Time  `gorm:"column:borrow_date;type:date;not null" json:"borrow_date"`
	DueDate         time.Time  `gorm:"column:due_date;type:date;not null" json:"due_date"`
	ReturnDate      *time.Time `gorm:"column:return_date;type:date" json:"return_date"`
	Status          string     `gorm:"column:status;type:varchar(15);not null;default:'BORROWED';check:chk_physical_loan_status,status IN ('BORROWED','RETURNED','OVERDUE','LOST')" json:"status"`
	FineAmount      float64    `gorm:"column:fine_amount;type:decimal(10,2);not null;default:0" json:"fine_amount"`
	FineStatus      string     `gorm:"column:fine_status;type:varchar(15);not null;default:'NONE';check:chk_physical_loan_fine_status,fine_status IN ('NONE','UNPAID','PAID')" json:"fine_status"`
	Timestamp

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user,omitempty"`
	Book Book `gorm:"foreignKey:BookID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"book,omitempty"`
}

func (PhysicalLoan) TableName() string {
	return "physical_loans"
}
