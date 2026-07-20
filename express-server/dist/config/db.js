"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const dbMonitor_1 = require("./dbMonitor");
const connectDB = async () => {
    const monitor = dbMonitor_1.MongoConnectionMonitor.getInstance();
    await monitor.connectWithMonitor();
};
exports.connectDB = connectDB;
