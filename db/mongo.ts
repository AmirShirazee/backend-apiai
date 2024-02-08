import mongoose, { ConnectOptions } from 'mongoose';
import colors from 'colors';
import { isProduction } from '../utils/isProd';

interface Connect extends ConnectOptions {
  maxPoolSize?: number;
}
mongoose.set('strictQuery', true);

const LOCAL_MONGO_DB = 'mongodb://127.0.0.1:27017/localApiAi';
const AZURE_COSMOS_DB =
  'mongodb://testgenerator-server:CTDzcIpWuy2eipa2ZSPTG1p9dErO6ReZuBUu4KBHphuy4pDRN8TmsUWnHqRbsgDtiXGedFlaVkkAACDbQOEzGQ==@testgenerator-server.mongo.cosmos.azure.com:10255/testgenerator-database?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@testgenerator-server@';

const connectionString = isProduction ? AZURE_COSMOS_DB : LOCAL_MONGO_DB;
if (!connectionString) {
  console.error(
    colors.red.underline('No DB connection string found. Please set the DB. Process exiting...'),
  );
  process.exit(1);
}

const connectDB = async () => {
  const connect: Connect = {
    maxPoolSize: 2,
  };
  try {
    const conn = await mongoose.connect(connectionString!, connect);
    console.info(colors.green.underline(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error: any) {
    console.error(colors.red.underline(`Error: ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
