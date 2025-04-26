import 'reflect-metadata'; // Required by routing-controllers
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase } from './data-source';

dotenv.config({ path: '.env' });


const app = express();
const port = process.env.PORT || 3000;

// Setup routing-controllers
useExpressServer(app, {
  controllers: [path.join(__dirname, '/controllers/**/*.controller{.ts,.js}')], // Path to controllers
  defaultErrorHandler: false 
});


initializeDatabase();

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}/api`);
}); 