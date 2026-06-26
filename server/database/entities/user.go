package entities

type User struct {
	ID              uint   `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Role            string `gorm:"column:role;type:varchar(10);not null;default:'USER';check:chk_users_role,role IN ('ADMIN','USER')" json:"role"`
	Username        string `gorm:"column:username;type:varchar(50);not null" json:"username"`
	PasswordHash    string `gorm:"column:password_hash;type:varchar(255);not null" json:"-"`
	FullName        string `gorm:"column:full_name;type:varchar(100);not null" json:"full_name"`
	Email           string `gorm:"column:email;type:varchar(100);not null;uniqueIndex" json:"email"`
	MembershipNumber string `gorm:"column:membership_number;type:varchar(20);uniqueIndex" json:"membership_number"`
	IdentityNumber  string `gorm:"column:identity_number;type:varchar(30);index" json:"identity_number"`
	Address         string `gorm:"column:address;type:text" json:"address"`
	PhoneNumber     string `gorm:"column:phone_number;type:varchar(20)" json:"phone_number"`
	Status          string `gorm:"column:status;type:varchar(10);not null;default:'ACTIVE';check:chk_users_status,status IN ('ACTIVE','INACTIVE','BLOCKED')" json:"status"`
	Timestamp

	PhysicalLoans   []PhysicalLoan   `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"physical_loans,omitempty"`
	DigitalLoans    []DigitalLoan    `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"digital_loans,omitempty"`
	ChatHistory     []ChatHistory    `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"chat_history,omitempty"`
}

func (User) TableName() string {
	return "users"
}
