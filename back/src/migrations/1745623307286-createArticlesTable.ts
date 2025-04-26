import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
} from "typeorm";
// Removed unused enum imports for JS compatibility
// import { AuthorSource } from "../../src/scrapers/types";
// import { Sentiment, Topic } from "../../src/mastra/types";

export class CreateArticlesTable1745623307286 implements MigrationInterface {
  private tableName = "scraped_articles";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: "url",
            type: "varchar",
            isPrimary: true,
            isNullable: false,
            isUnique: true,
          },
          {
            name: "title",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "author",
            type: "varchar", // Storing enum as varchar in SQLite
            isNullable: false,
          },
          {
            name: "publishedDate",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "sentiment",
            type: "varchar", // Storing enum as varchar in SQLite
            isNullable: true,
          },
          {
            name: "topic",
            type: "varchar", // Storing enum as varchar in SQLite
            isNullable: true,
          },
          {
            name: "digest",
            type: "text",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "datetime", // SQLite typically uses datetime
            default: "CURRENT_TIMESTAMP", // Or relevant function for your DB
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "datetime", // SQLite typically uses datetime
            default: "CURRENT_TIMESTAMP", // Or relevant function for your DB
            onUpdate: "CURRENT_TIMESTAMP", // Ensure updates on change
            isNullable: false,
          },
        ] as TableColumnOptions[], // Cast needed because of enum types used below
      }),
      true // Create foreign keys if specified (none here)
    );

    // Note: SQLite doesn't natively support ENUM types in the same way as PostgreSQL/MySQL.
    // We store them as 'varchar' and rely on the application layer (TypeORM entity definition)
    // to handle the enum constraints. You could add CHECK constraints manually if needed.
    // Example CHECK constraint (add within createTable columns array or separately):
    // { name: 'author_check', type: 'check', expression: `"author" IN (${Object.values(AuthorSource).map(v => `'${v}'`).join(', ')})` }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
  }
}
