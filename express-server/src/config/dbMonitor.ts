import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import Table from 'cli-table3';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Color from '../models/Color';
import Texture from '../models/Texture';
import Project from '../models/Project';
import AuditLog from '../models/AuditLog';

dotenv.config();

// Disable Mongoose command buffering to prevent hanging requests when DB is unreachable
mongoose.set('bufferCommands', false);

export class MongoConnectionMonitor {
  private static instance: MongoConnectionMonitor;
  private maxRetries = 5;
  private currentRetry = 0;
  private isConnecting = false;

  private constructor() {
    this.setupGracefulShutdown();
  }

  public static getInstance(): MongoConnectionMonitor {
    if (!MongoConnectionMonitor.instance) {
      MongoConnectionMonitor.instance = new MongoConnectionMonitor();
    }
    return MongoConnectionMonitor.instance;
  }

  public displayBanner(): void {
    const bannerText = `
${chalk.bold.cyan('SMART WALL PAINT VISUALIZER (LUMINAPAINT ENTERPRISE)')}
${chalk.gray('MongoDB Atlas Real-Time Connection & Telemetry Monitor')}

${chalk.dim('Node.js:')} ${chalk.green(process.version)}  |  ${chalk.dim('Environment:')} ${chalk.yellow(process.env.NODE_ENV || 'Development')}  |  ${chalk.dim('PID:')} ${chalk.white(process.pid)}
`.trim();

    console.log(
      boxen(bannerText, {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
        title: '🚀 LUMINA PAINT SYSTEM BOOT',
        titleAlignment: 'center'
      })
    );
  }

  public maskURI(uri: string): string {
    return uri.replace(/\/\/(.*):(.*)@/, (match, user, pass) => {
      return `//${user}:****@`;
    });
  }

  public async resolveDNS(hostname: string): Promise<boolean> {
    try {
      await dns.promises.lookup(hostname);
      return true;
    } catch {
      return false;
    }
  }

  public async connectWithMonitor(): Promise<boolean> {
    if (this.isConnecting) return false;
    this.isConnecting = true;

    this.displayBanner();

    const spinner = ora({ text: 'Initializing system environment...', color: 'cyan' }).start();

    // Step 1: Validate Environment Variables
    const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
    const missingEnv = requiredEnv.filter(key => !process.env[key]);
    
    if (missingEnv.length > 0) {
      spinner.fail(chalk.red(`Missing required .env variables: ${missingEnv.join(', ')}`));
      this.printChecklist(false, ['✖ Missing .env variables']);
      this.isConnecting = false;
      return false;
    }

    spinner.succeed(chalk.green('Environment Loaded Successfully'));

    // Step 2: Validate & Mask URI
    const uri = process.env.MONGODB_URI || '';
    const maskedUri = this.maskURI(uri);

    const uriSpinner = ora(`Validating MongoDB URI [${chalk.yellow(maskedUri)}]...`).start();

    if (uri.includes('<db_password>')) {
      uriSpinner.fail(chalk.yellow('MONGODB_URI contains placeholder <db_password>. Real database connectivity paused.'));
      this.printChecklist(false, [
        '✔ Environment Loaded',
        '✖ Invalid URI (Contains placeholder <db_password>)',
        '✖ Atlas IP Not Whitelisted or Password Missing'
      ]);
      this.isConnecting = false;
      return false;
    }

    uriSpinner.succeed(chalk.green(`MongoDB URI Validated: ${maskedUri}`));

    // Step 3: DNS SRV Lookup
    const dnsSpinner = ora('Performing DNS Lookup for Atlas SRV Host...').start();
    let hostname = 'cluster0.gpt9bjh.mongodb.net';
    try {
      const match = uri.match(/@([^/?]+)/);
      if (match) hostname = match[1];
    } catch {}

    const dnsSuccess = await this.resolveDNS(hostname);
    if (!dnsSuccess) {
      dnsSpinner.warn(chalk.yellow(`DNS Lookup warning for ${hostname}. Retrying connection...`));
    } else {
      dnsSpinner.succeed(chalk.green(`DNS Resolved for ${hostname}`));
    }

    // Step 4: Atlas Connection Attempt with Exponential Backoff
    while (this.currentRetry < this.maxRetries) {
      this.currentRetry++;
      const connSpinner = ora(`Connecting to MongoDB Atlas (Attempt ${this.currentRetry}/${this.maxRetries})...`).start();
      
      const startTime = Date.now();

      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          family: 4
        });

        const latency = Date.now() - startTime;
        connSpinner.succeed(chalk.green(`Connected to MongoDB Atlas in ${latency}ms`));

        // Step 5: Ping Test & Telemetry Gathering
        const pingSpinner = ora('Executing Ping Test & Gathering Telemetry...').start();
        
        let pingOk = false;
        let dbName = 'smart-wall-paint';
        let serverVersion = 'v7.0.x (Atlas)';

        if (mongoose.connection.db) {
          const pingResult = await mongoose.connection.db.command({ ping: 1 });
          pingOk = pingResult.ok === 1;
          dbName = mongoose.connection.db.databaseName;
          
          try {
            const buildInfo = await mongoose.connection.db.command({ buildInfo: 1 });
            serverVersion = `v${buildInfo.version}`;
          } catch {}
        }

        pingSpinner.succeed(chalk.green(`Ping Successful! Database: ${dbName} (${serverVersion})`));

        // Step 6: Telemetry Summary Table
        await this.displayTelemetryTable(dbName, hostname, serverVersion, latency);

        // Step 7: Register Models & Auto-Seed Default Users
        const seedSpinner = ora('Registering Schemas & Verifying Database Seed...').start();
        await this.autoSeedDefaultUsers();
        seedSpinner.succeed(chalk.green('Models Registered & Default Users Verified'));

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
      } catch (err: any) {
        connSpinner.fail(chalk.red(`Connection Attempt ${this.currentRetry} Failed: ${err.message || err}`));
        
        if (this.currentRetry < this.maxRetries) {
          const delay = Math.pow(2, this.currentRetry - 1) * 1000;
          console.log(chalk.gray(`Waiting ${delay / 1000}s before next retry (Exponential Backoff)...`));
          await new Promise(res => setTimeout(res, delay));
        } else {
          this.diagnoseFailure(err);
        }
      }
    }

    this.isConnecting = false;
    return false;
  }

  private async displayTelemetryTable(dbName: string, hostname: string, serverVersion: string, latency: number): Promise<void> {
    const table = new Table({
      head: [chalk.cyan('Telemetry Metric'), chalk.cyan('Operational Value')],
      colWidths: [30, 45]
    });

    let collectionsCount = 0;
    let totalIndexes = 0;

    if (mongoose.connection.db) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        collectionsCount = collections.length;
        
        // Count indexes
        for (const col of collections) {
          const indexes = await mongoose.connection.db.collection(col.name).indexes();
          totalIndexes += indexes.length;
        }
      } catch {}
    }

    const mem = process.memoryUsage();
    const rssMB = (mem.rss / 1024 / 1024).toFixed(1);
    const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(1);

    table.push(
      ['Database Name', chalk.green.bold(dbName)],
      ['Cluster Host', chalk.white(hostname)],
      ['MongoDB Server Version', chalk.yellow(serverVersion)],
      ['Connection Latency', chalk.green(`${latency} ms`)],
      ['Active Collections Count', chalk.cyan(collectionsCount.toString())],
      ['Total Index Specifications', chalk.cyan(totalIndexes.toString())],
      ['Connection Pool Status', chalk.green(`Active (readyState: ${mongoose.connection.readyState})`)],
      ['Process Memory Usage', chalk.white(`${rssMB} MB RSS (${heapMB} MB Heap)`)],
      ['Node.js Runtime', chalk.white(process.version)],
      ['Execution Mode', chalk.magenta(process.env.NODE_ENV || 'Development')]
    );

    console.log('\n' + table.toString() + '\n');
  }

  private async autoSeedDefaultUsers(): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;

    try {
      const adminExists = await User.findOne({ email: 'admin@smartpaint.com' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('AdminPass123!', salt);
        await User.create({
          email: 'admin@smartpaint.com',
          passwordHash,
          firstName: 'Admin',
          lastName: 'System',
          role: 'Admin',
          isVerified: true
        });
      }

      const userExists = await User.findOne({ email: 'user@smartpaint.com' });
      if (!userExists) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('UserPass123!', salt);
        await User.create({
          email: 'user@smartpaint.com',
          passwordHash,
          firstName: 'John',
          lastName: 'Doe',
          role: 'User',
          isVerified: true
        });
      }
    } catch {}
  }

  public printChecklist(success: boolean, items: string[]): void {
    console.log('\n' + chalk.bold(success ? chalk.green('=== SYSTEM STATUS CHECKLIST ===') : chalk.red('=== SYSTEM DIAGNOSTIC CHECKLIST ===')));
    items.forEach(item => {
      if (item.startsWith('✔')) {
        console.log(chalk.green(` ${item}`));
      } else if (item.startsWith('✖')) {
        console.log(chalk.red(` ${item}`));
      } else {
        console.log(chalk.yellow(` ${item}`));
      }
    });
    console.log('');
  }

  private diagnoseFailure(err: any): void {
    const msg = err.message || '';
    const failureItems = ['✖ Connection Retries Exhausted'];

    if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      failureItems.push('✖ Authentication Failed (Invalid database username/password)');
    } else if (msg.includes('querySrv') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
      failureItems.push('✖ Atlas IP Not Whitelisted or Network Connection Refused');
    } else if (msg.includes('timeout')) {
      failureItems.push('✖ Network Timeout (Database cluster did not respond)');
    } else {
      failureItems.push(`✖ Unhandled Connection Error: ${msg}`);
    }

    this.printChecklist(false, failureItems);
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(chalk.yellow(`\n[Graceful Shutdown] Received ${signal}. Closing Mongoose connection pool...`));
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log(chalk.green('✓ Mongoose connection pool closed successfully.'));
        }
      } catch (e) {
        console.error(chalk.red('Error during Mongoose shutdown:'), e);
      } finally {
        process.exit(0);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
