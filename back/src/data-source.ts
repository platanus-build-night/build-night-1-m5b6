import { DataSource } from "typeorm";
import { ScrapedArticleDetail } from "./models"; // Import the entity - removed .ts extension

// Simple configuration for SQLite stored in the root
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite", // Stores the DB file in the root directory
  synchronize: false, // Set to false when using migrations
  logging: false, // Set to true for debugging SQL queries
  entities: [ScrapedArticleDetail], // Register the entity
  migrations: ["src/migrations/**/*.ts"], // Add migrations path glob
  subscribers: [], // Add subscribers path if needed
});

// Function to initialize the data source
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    } else {
      console.log("Data Source was already initialized.");
    }
    return AppDataSource;
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    throw err; // Re-throw error to handle it upstream
  }
}

// Example of getting the repository
export function getArticleRepository() {
  if (!AppDataSource.isInitialized) {
    throw new Error(
      "DataSource is not initialized. Call initializeDatabase first."
    );
  }
  return AppDataSource.getRepository(ScrapedArticleDetail);
} 