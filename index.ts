import express, { Express } from 'express';
import colors from 'colors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initRoutes } from './routes';
import { initRateLimit } from './startup/rate-limit';
import { isProduction } from './utils/isProd';
import connectDB from './db/mongo';

const port = process.env.PORT || 8080;
const app: Express = express();

// Initialize middleware
const initializeMiddleware = (app: Express) => {
  initRateLimit(app);

  app.use(
    cors({
      origin: isProduction ? 'https://testgenerator.azurewebsites.net' : 'http://localhost:8080',
      credentials: true,
    }),
  );

  app.use(cookieParser('secret-cookie'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  initRoutes(app);
};

const startServer = () => {
  app.listen(port, (): void => {
    console.log(colors.green.underline(`Server running on port ${port}`));
  });
};

// Connect to database and then prepare the Next.js application
connectDB()
  .then(() => {
    initializeMiddleware(app);

    startServer();
  })
  .catch((err: Error) => {
    console.error(err.message);
  });

export default app;
