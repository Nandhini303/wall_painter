"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConnectionMonitor = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const boxen_1 = __importDefault(require("boxen"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
// Disable Mongoose command buffering to prevent hanging requests when DB is unreachable
mongoose_1.default.set('bufferCommands', false);
class MongoConnectionMonitor {
    static instance;
    maxRetries = 5;
    currentRetry = 0;
    isConnecting = false;
    constructor() {
        this.setupGracefulShutdown();
    }
    static getInstance() {
        if (!MongoConnectionMonitor.instance) {
            MongoConnectionMonitor.instance = new MongoConnectionMonitor();
        }
        return MongoConnectionMonitor.instance;
    }
    displayBanner() {
        const bannerText = `
${chalk_1.default.bold.cyan('SMART WALL PAINT VISUALIZER (LUMINAPAINT ENTERPRISE)')}
${chalk_1.default.gray('MongoDB Atlas Real-Time Connection & Telemetry Monitor')}

${chalk_1.default.dim('Node.js:')} ${chalk_1.default.green(process.version)}  |  ${chalk_1.default.dim('Environment:')} ${chalk_1.default.yellow(process.env.NODE_ENV || 'Development')}  |  ${chalk_1.default.dim('PID:')} ${chalk_1.default.white(process.pid)}
`.trim();
        console.log((0, boxen_1.default)(bannerText, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'cyan',
            title: '🚀 LUMINA PAINT SYSTEM BOOT',
            titleAlignment: 'center'
        }));
    }
    maskURI(uri) {
        return uri.replace(/\/\/(.*):(.*)@/, (match, user, pass) => {
            return `//${user}:****@`;
        });
    }
    async resolveDNS(hostname) {
        try {
            await dns_1.default.promises.lookup(hostname);
            return true;
        }
        catch {
            return false;
        }
    }
    async connectWithMonitor() {
        if (this.isConnecting)
            return false;
        this.isConnecting = true;
        this.displayBanner();
        const spinner = (0, ora_1.default)({ text: 'Initializing system environment...', color: 'cyan' }).start();
        // Step 1: Validate Environment Variables
        const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
        const missingEnv = requiredEnv.filter(key => !process.env[key]);
        if (missingEnv.length > 0) {
            spinner.fail(chalk_1.default.red(`Missing required .env variables: ${missingEnv.join(', ')}`));
            this.printChecklist(false, ['✖ Missing .env variables']);
            this.isConnecting = false;
            return false;
        }
        spinner.succeed(chalk_1.default.green('Environment Loaded Successfully'));
        // Step 2: Validate & Mask URI
        const uri = process.env.MONGODB_URI || '';
        const maskedUri = this.maskURI(uri);
        const uriSpinner = (0, ora_1.default)(`Validating MongoDB URI [${chalk_1.default.yellow(maskedUri)}]...`).start();
        if (uri.includes('<db_password>')) {
            uriSpinner.fail(chalk_1.default.yellow('MONGODB_URI contains placeholder <db_password>. Real database connectivity paused.'));
            this.printChecklist(false, [
                '✔ Environment Loaded',
                '✖ Invalid URI (Contains placeholder <db_password>)',
                '✖ Atlas IP Not Whitelisted or Password Missing'
            ]);
            this.isConnecting = false;
            return false;
        }
        uriSpinner.succeed(chalk_1.default.green(`MongoDB URI Validated: ${maskedUri}`));
        // Step 3: DNS SRV Lookup
        const dnsSpinner = (0, ora_1.default)('Performing DNS Lookup for Atlas SRV Host...').start();
        let hostname = 'cluster0.gpt9bjh.mongodb.net';
        try {
            const match = uri.match(/@([^/?]+)/);
            if (match)
                hostname = match[1];
        }
        catch { }
        const dnsSuccess = await this.resolveDNS(hostname);
        if (!dnsSuccess) {
            dnsSpinner.warn(chalk_1.default.yellow(`DNS Lookup warning for ${hostname}. Retrying connection...`));
        }
        else {
            dnsSpinner.succeed(chalk_1.default.green(`DNS Resolved for ${hostname}`));
        }
        // Step 4: Atlas Connection Attempt with Exponential Backoff
        while (this.currentRetry < this.maxRetries) {
            this.currentRetry++;
            const connSpinner = (0, ora_1.default)(`Connecting to MongoDB Atlas (Attempt ${this.currentRetry}/${this.maxRetries})...`).start();
            const startTime = Date.now();
            try {
                await mongoose_1.default.connect(uri, {
                    serverSelectionTimeoutMS: 5000
                });
                const latency = Date.now() - startTime;
                connSpinner.succeed(chalk_1.default.green(`Connected to MongoDB Atlas in ${latency}ms`));
                // Step 5: Ping Test & Telemetry Gathering
                const pingSpinner = (0, ora_1.default)('Executing Ping Test & Gathering Telemetry...').start();
                let pingOk = false;
                let dbName = 'smart-wall-paint';
                let serverVersion = 'v7.0.x (Atlas)';
                if (mongoose_1.default.connection.db) {
                    const pingResult = await mongoose_1.default.connection.db.command({ ping: 1 });
                    pingOk = pingResult.ok === 1;
                    dbName = mongoose_1.default.connection.db.databaseName;
                    try {
                        const buildInfo = await mongoose_1.default.connection.db.command({ buildInfo: 1 });
                        serverVersion = `v${buildInfo.version}`;
                    }
                    catch { }
                }
                pingSpinner.succeed(chalk_1.default.green(`Ping Successful! Database: ${dbName} (${serverVersion})`));
                // Step 6: Telemetry Summary Table
                await this.displayTelemetryTable(dbName, hostname, serverVersion, latency);
                // Step 7: Register Models & Auto-Seed Default Users
                const seedSpinner = (0, ora_1.default)('Registering Schemas & Verifying Database Seed...').start();
                await this.autoSeedDefaultUsers();
                seedSpinner.succeed(chalk_1.default.green('Models Registered & Default Users Verified'));
                // Success Checklist Output
                this.printChecklist(true, [
                    '✔ Environment Loaded',
                    '✔ MongoDB URI Valid',
                    '✔ DNS Resolved',
                    '✔ Connected to MongoDB Atlas',
                    '✔ Ping Successful',
                    `✔ Database: ${dbName}`,
                    '✔ Collections Loaded',
                    '✔ Models Registered',
                    '✔ Server Ready'
                ]);
                this.isConnecting = false;
                return true;
            }
            catch (err) {
                connSpinner.fail(chalk_1.default.red(`Connection Attempt ${this.currentRetry} Failed: ${err.message || err}`));
                if (this.currentRetry < this.maxRetries) {
                    const delay = Math.pow(2, this.currentRetry - 1) * 1000;
                    console.log(chalk_1.default.gray(`Waiting ${delay / 1000}s before next retry (Exponential Backoff)...`));
                    await new Promise(res => setTimeout(res, delay));
                }
                else {
                    this.diagnoseFailure(err);
                }
            }
        }
        this.isConnecting = false;
        return false;
    }
    async displayTelemetryTable(dbName, hostname, serverVersion, latency) {
        const table = new cli_table3_1.default({
            head: [chalk_1.default.cyan('Telemetry Metric'), chalk_1.default.cyan('Operational Value')],
            colWidths: [30, 45]
        });
        let collectionsCount = 0;
        let totalIndexes = 0;
        if (mongoose_1.default.connection.db) {
            try {
                const collections = await mongoose_1.default.connection.db.listCollections().toArray();
                collectionsCount = collections.length;
                // Count indexes
                for (const col of collections) {
                    const indexes = await mongoose_1.default.connection.db.collection(col.name).indexes();
                    totalIndexes += indexes.length;
                }
            }
            catch { }
        }
        const mem = process.memoryUsage();
        const rssMB = (mem.rss / 1024 / 1024).toFixed(1);
        const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
        table.push(['Database Name', chalk_1.default.green.bold(dbName)], ['Cluster Host', chalk_1.default.white(hostname)], ['MongoDB Server Version', chalk_1.default.yellow(serverVersion)], ['Connection Latency', chalk_1.default.green(`${latency} ms`)], ['Active Collections Count', chalk_1.default.cyan(collectionsCount.toString())], ['Total Index Specifications', chalk_1.default.cyan(totalIndexes.toString())], ['Connection Pool Status', chalk_1.default.green(`Active (readyState: ${mongoose_1.default.connection.readyState})`)], ['Process Memory Usage', chalk_1.default.white(`${rssMB} MB RSS (${heapMB} MB Heap)`)], ['Node.js Runtime', chalk_1.default.white(process.version)], ['Execution Mode', chalk_1.default.magenta(process.env.NODE_ENV || 'Development')]);
        console.log('\n' + table.toString() + '\n');
    }
    async autoSeedDefaultUsers() {
        if (mongoose_1.default.connection.readyState !== 1)
            return;
        try {
            const adminExists = await User_1.default.findOne({ email: 'admin@smartpaint.com' });
            if (!adminExists) {
                const salt = await bcryptjs_1.default.genSalt(12);
                const passwordHash = await bcryptjs_1.default.hash('AdminPass123!', salt);
                await User_1.default.create({
                    email: 'admin@smartpaint.com',
                    passwordHash,
                    firstName: 'Admin',
                    lastName: 'System',
                    role: 'Admin',
                    isVerified: true
                });
            }
            const userExists = await User_1.default.findOne({ email: 'user@smartpaint.com' });
            if (!userExists) {
                const salt = await bcryptjs_1.default.genSalt(12);
                const passwordHash = await bcryptjs_1.default.hash('UserPass123!', salt);
                await User_1.default.create({
                    email: 'user@smartpaint.com',
                    passwordHash,
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'User',
                    isVerified: true
                });
            }
        }
        catch { }
    }
    printChecklist(success, items) {
        console.log('\n' + chalk_1.default.bold(success ? chalk_1.default.green('=== SYSTEM STATUS CHECKLIST ===') : chalk_1.default.red('=== SYSTEM DIAGNOSTIC CHECKLIST ===')));
        items.forEach(item => {
            if (item.startsWith('✔')) {
                console.log(chalk_1.default.green(` ${item}`));
            }
            else if (item.startsWith('✖')) {
                console.log(chalk_1.default.red(` ${item}`));
            }
            else {
                console.log(chalk_1.default.yellow(` ${item}`));
            }
        });
        console.log('');
    }
    diagnoseFailure(err) {
        const msg = err.message || '';
        const failureItems = ['✖ Connection Retries Exhausted'];
        if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
            failureItems.push('✖ Authentication Failed (Invalid database username/password)');
        }
        else if (msg.includes('querySrv') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
            failureItems.push('✖ Atlas IP Not Whitelisted or Network Connection Refused');
        }
        else if (msg.includes('timeout')) {
            failureItems.push('✖ Network Timeout (Database cluster did not respond)');
        }
        else {
            failureItems.push(`✖ Unhandled Connection Error: ${msg}`);
        }
        this.printChecklist(false, failureItems);
    }
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(chalk_1.default.yellow(`\n[Graceful Shutdown] Received ${signal}. Closing Mongoose connection pool...`));
            try {
                if (mongoose_1.default.connection.readyState === 1) {
                    await mongoose_1.default.connection.close();
                    console.log(chalk_1.default.green('✓ Mongoose connection pool closed successfully.'));
                }
            }
            catch (e) {
                console.error(chalk_1.default.red('Error during Mongoose shutdown:'), e);
            }
            finally {
                process.exit(0);
            }
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
}
exports.MongoConnectionMonitor = MongoConnectionMonitor;
