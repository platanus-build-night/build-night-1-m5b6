"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateArticlesTable1745623307286 = void 0;
const typeorm_1 = require("typeorm");
// Removed unused enum imports for JS compatibility
// import { AuthorSource } from "../../src/scrapers/types";
// import { Sentiment, Topic } from "../../src/mastra/types";
class CreateArticlesTable1745623307286 {
    constructor() {
        this.tableName = "scraped_articles";
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.createTable(new typeorm_1.Table({
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
                ], // Cast needed because of enum types used below
            }), true // Create foreign keys if specified (none here)
            );
            // Note: SQLite doesn't natively support ENUM types in the same way as PostgreSQL/MySQL.
            // We store them as 'varchar' and rely on the application layer (TypeORM entity definition)
            // to handle the enum constraints. You could add CHECK constraints manually if needed.
            // Example CHECK constraint (add within createTable columns array or separately):
            // { name: 'author_check', type: 'check', expression: `"author" IN (${Object.values(AuthorSource).map(v => `'${v}'`).join(', ')})` }
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.dropTable(this.tableName);
        });
    }
}
exports.CreateArticlesTable1745623307286 = CreateArticlesTable1745623307286;
