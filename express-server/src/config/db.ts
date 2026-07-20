import { MongoConnectionMonitor } from './dbMonitor';

export const connectDB = async (): Promise<void> => {
  const monitor = MongoConnectionMonitor.getInstance();
  await monitor.connectWithMonitor();
};
