import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddScoreColumnToArticles1745637726099
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "scraped_articles",
      new TableColumn({
        name: "score",
        type: "integer",
        default: 0,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("scraped_articles", "score");
  }
}
