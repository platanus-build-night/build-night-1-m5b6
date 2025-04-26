"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata"); // Required by routing-controllers
const express_1 = __importDefault(require("express"));
const routing_controllers_1 = require("routing-controllers");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({ path: ".env" });
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
}));
const port = process.env.PORT || 3000;
// Setup routing-controllers
(0, routing_controllers_1.useExpressServer)(app, {
    controllers: [path_1.default.join(__dirname, "/controllers/**/*.controller{.ts,.js}")], // Path to controllers
    defaultErrorHandler: false,
});
(0, data_source_1.initializeDatabase)();
app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}/api`);
});
