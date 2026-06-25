package database

import (
	"fmt"

	"github.com/literasiKu/database/config"
	"github.com/literasiKu/database/entities"
)

type fkSpec struct {
	table string
	name  string
	stmt  string
}

var foreignKeys = []fkSpec{
	{
		table: "books",
		name:  "fk_books_book_categories",
		stmt:  `ALTER TABLE books ADD CONSTRAINT fk_books_book_categories FOREIGN KEY (category_id) REFERENCES book_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "files",
		name:  "fk_files_books",
		stmt:  `ALTER TABLE files ADD CONSTRAINT fk_files_books FOREIGN KEY (book_id) REFERENCES books(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "physical_loans",
		name:  "fk_physical_loans_users",
		stmt:  `ALTER TABLE physical_loans ADD CONSTRAINT fk_physical_loans_users FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "physical_loans",
		name:  "fk_physical_loans_books",
		stmt:  `ALTER TABLE physical_loans ADD CONSTRAINT fk_physical_loans_books FOREIGN KEY (book_id) REFERENCES books(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "digital_loans",
		name:  "fk_digital_loans_users",
		stmt:  `ALTER TABLE digital_loans ADD CONSTRAINT fk_digital_loans_users FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "digital_loans",
		name:  "fk_digital_loans_books",
		stmt:  `ALTER TABLE digital_loans ADD CONSTRAINT fk_digital_loans_books FOREIGN KEY (book_id) REFERENCES books(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "chat_histories",
		name:  "fk_chat_histories_users",
		stmt:  `ALTER TABLE chat_histories ADD CONSTRAINT fk_chat_histories_users FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "chat_histories",
		name:  "fk_chat_histories_digital_loans",
		stmt:  `ALTER TABLE chat_histories ADD CONSTRAINT fk_chat_histories_digital_loans FOREIGN KEY (digital_loan_id) REFERENCES digital_loans(id) ON UPDATE CASCADE ON DELETE SET NULL`,
	},
}

func AutoMigrate() error {
	db := config.GetDB()
	if db == nil {
		return fmt.Errorf("database connection is not initialized")
	}

	if err := db.AutoMigrate(
		&entities.User{},
		&entities.BookCategory{},
		&entities.Book{},
		&entities.File{},
		&entities.PhysicalLoan{},
		&entities.DigitalLoan{},
		&entities.ChatHistory{},
	); err != nil {
		return fmt.Errorf("Auto migrate models: %w", err)
	}

	migrator := db.Migrator()
	for _, fk := range foreignKeys {
		if migrator.HasConstraint(fk.table, fk.name) {
			continue
		}
		if err := db.Exec(fk.stmt).Error; err != nil {
			return fmt.Errorf("add FK %s: %w", fk.name, err)
		}
	}

	return nil
}
