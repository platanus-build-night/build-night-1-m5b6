import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { AuthorSource, Topic, Sentiment } from "../scrapers/types";
import { ScrapedArticleDetail as IScrapedArticleDetail } from "../scrapers/types"; // Import the interface

@Entity("scraped_articles")
export class Article implements IScrapedArticleDetail {
  @PrimaryColumn({ type: "varchar", nullable: false })
  url!: string;

  @Column({ type: "varchar", nullable: true })
  title?: string;

  @Column({
    type: "varchar",
    enum: AuthorSource,
    nullable: false,
  })
  author!: AuthorSource;

  @Column({ type: "varchar", nullable: true }) // Storing as varchar as per interface
  publishedDate?: string;

  @Column({ type: "text" }) // Use 'text' for potentially long content
  content!: string;

  @Column({
    type: "varchar",
    enum: Sentiment,
    nullable: true,
  })
  sentiment?: Sentiment; // Use the Enum type here

  @Column({
    type: "varchar",
    enum: Topic,
    nullable: true,
  })
  topic?: Topic; // Use the Enum type here

  @Column({ type: "text", nullable: true })
  digest?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
