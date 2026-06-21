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
		table: "buku",
		name:  "fk_buku_kategori_buku",
		stmt:  `ALTER TABLE buku ADD CONSTRAINT fk_buku_kategori_buku FOREIGN KEY (id_kategori) REFERENCES kategori_buku(id_kategori) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "file_pdf",
		name:  "fk_file_pdf_buku",
		stmt:  `ALTER TABLE file_pdf ADD CONSTRAINT fk_file_pdf_buku FOREIGN KEY (id_buku) REFERENCES buku(id_buku) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "peminjaman_fisik",
		name:  "fk_peminjaman_fisik_users",
		stmt:  `ALTER TABLE peminjaman_fisik ADD CONSTRAINT fk_peminjaman_fisik_users FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "peminjaman_fisik",
		name:  "fk_peminjaman_fisik_buku",
		stmt:  `ALTER TABLE peminjaman_fisik ADD CONSTRAINT fk_peminjaman_fisik_buku FOREIGN KEY (id_buku) REFERENCES buku(id_buku) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "peminjaman_digital",
		name:  "fk_peminjaman_digital_users",
		stmt:  `ALTER TABLE peminjaman_digital ADD CONSTRAINT fk_peminjaman_digital_users FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "peminjaman_digital",
		name:  "fk_peminjaman_digital_buku",
		stmt:  `ALTER TABLE peminjaman_digital ADD CONSTRAINT fk_peminjaman_digital_buku FOREIGN KEY (id_buku) REFERENCES buku(id_buku) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "riwayat_chatbot",
		name:  "fk_riwayat_chatbot_users",
		stmt:  `ALTER TABLE riwayat_chatbot ADD CONSTRAINT fk_riwayat_chatbot_users FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT`,
	},
	{
		table: "riwayat_chatbot",
		name:  "fk_riwayat_chatbot_peminjaman_digital",
		stmt:  `ALTER TABLE riwayat_chatbot ADD CONSTRAINT fk_riwayat_chatbot_peminjaman_digital FOREIGN KEY (id_peminjaman_digital) REFERENCES peminjaman_digital(id_peminjaman_digital) ON UPDATE CASCADE ON DELETE SET NULL`,
	},
}

func AutoMigrate() error {
	db := config.GetDB()
	if db == nil {
		return fmt.Errorf("database connection is not initialized")
	}

	if err := db.AutoMigrate(
		&entities.User{},
		&entities.KategoriBuku{},
		&entities.Buku{},
		&entities.FilePDF{},
		&entities.PeminjamanFisik{},
		&entities.PeminjamanDigital{},
		&entities.RiwayatChatbot{},
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
