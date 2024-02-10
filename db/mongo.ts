import mongoose, { ConnectOptions } from 'mongoose';
import colors from 'colors';
import { isProduction } from '../utils/isProd';

interface Connect extends ConnectOptions {
  maxPoolSize?: number;
}
mongoose.set('strictQuery', true);

const connectionString = 'mongodb+srv://root:root@cluster0.2v1s9.mongodb.net/ApiAi?retryWrites=true&w=majority'
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
