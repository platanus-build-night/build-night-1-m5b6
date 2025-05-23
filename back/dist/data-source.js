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
exports.AppDataSource = void 0;
exports.initializeDatabase = initializeDatabase;
exports.getArticleRepository = getArticleRepository;
exports.saveArticles = saveArticles;
const typeorm_1 = require("typeorm");
const models_1 = require("./models/models"); // Import the entity - removed .ts extension
const DATABASE_PATH = process.env.ENV === "prod"
    ? "/data/db.sqlite"
    : "database.sqlite";
// Simple configuration for SQLite stored in the root
exports.AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: DATABASE_PATH, // Stores the DB file in the root directory
    synchronize: false, // Set to false when using migrations
    logging: false, // Set to true for debugging SQL queries
    entities: [models_1.Article], // Register the entity
    migrations: ["src/migrations/**/*.ts"], // Add migrations path glob
    subscribers: [], // Add subscribers path if needed
});
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!exports.AppDataSource.isInitialized) {
                yield exports.AppDataSource.initialize();
                console.log("Data Source has been initialized!");
            }
            else {
                console.log("Data Source was already initialized.");
            }
            return exports.AppDataSource;
        }
        catch (err) {
            console.error("Error during Data Source initialization:", err);
            throw err; // Re-throw error to handle it upstream
        }
    });
}
function getArticleRepository() {
    if (!exports.AppDataSource.isInitialized) {
        throw new Error("DataSource is not initialized. Call initializeDatabase first.");
    }
    return exports.AppDataSource.getRepository(models_1.Article);
}
function saveArticles(articles) {
    return __awaiter(this, void 0, void 0, function* () {
        const articleRepository = getArticleRepository();
        yield articleRepository.save(articles);
    });
}
