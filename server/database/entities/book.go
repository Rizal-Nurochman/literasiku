package entities

type Book struct {
	ID          uint   `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	CategoryID  uint   `gorm:"column:category_id;not null;index" json:"category_id"`
	Title       string `gorm:"column:title;type:varchar(255);not null;index" json:"title"`
	Author      string `gorm:"column:author;type:varchar(100);not null;index" json:"author"`
	Publisher   string `gorm:"column:publisher;type:varchar(100)" json:"publisher"`
	YearPublished int  `gorm:"column:year_published;type:smallint" json:"year_published"`
	ISBN        string `gorm:"column:isbn;type:varchar(20);uniqueIndex" json:"isbn"`
	PhysicalStock int  `gorm:"column:physical_stock;not null;default:0" json:"physical_stock"`
	IsPhysicalAvailable bool `gorm:"column:is_physical_available;not null;default:true" json:"is_physical_available"`
	IsDigitalAvailable bool  `gorm:"column:is_digital_available;not null;default:false" json:"is_digital_available"`
	Status      string `gorm:"column:status;type:varchar(10);not null;default:'ACTIVE';check:chk_book_status,status IN ('ACTIVE','INACTIVE','DAMAGED','LOST')" json:"status"`
	BookURL     string `gorm:"column:book_url;type:varchar(255)" json:"book_url"`
	Timestamp

	Category        BookCategory      `gorm:"foreignKey:CategoryID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"category,omitempty"`
	Files           []File            `gorm:"foreignKey:BookID;references:ID" json:"files,omitempty"`
	PhysicalLoans   []PhysicalLoan    `gorm:"foreignKey:BookID;references:ID" json:"physical_loans,omitempty"`
	DigitalLoans    []DigitalLoan     `gorm:"foreignKey:BookID;references:ID" json:"digital_loans,omitempty"`
}

func (Book) TableName() string {
	return "books"
}
