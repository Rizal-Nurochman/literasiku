package entities

type BookCategory struct {
	ID   uint   `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"column:name;type:varchar(50);not null;uniqueIndex" json:"name"`
	Timestamp

	Books []Book `gorm:"foreignKey:CategoryID;references:ID" json:"books,omitempty"`
}

func (BookCategory) TableName() string {
	return "book_categories"
}
