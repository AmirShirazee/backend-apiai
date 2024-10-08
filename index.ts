import express, { Express, Request, Response, NextFunction } from "express";
import colors from "colors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import { initRoutes } from "./routes";
import { initRateLimit } from "./startup/rate-limit";
import { isProduction } from "./utils/isProd";
import connectDB from "./db/mongo";

const port = 3000;
const app: Express = express();

const allowedOrigins = ["http://localhost:8080", "https://testopenapi.com"];
const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ): void => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const initializeMiddleware = (app: Express) => {
  // Initialize rate limiting
  initRateLimit(app);

  // Initialize CORS
  app.use(cors(corsOptions));

  // Handle preflight requests
  app.options("*", cors(corsOptions));

  // Other middleware
  app.use(cookieParser("secret-cookie"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan(isProduction ? "combined" : "dev"));

  // Initialize routes
  initRoutes(app);
};

// Health check route outside of initRoutes to ensure it's available
app.get("/backend/api/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running!" });
});

const startServer = () => {
  app.listen(port, (): void => {
    console.log(colors.green.underline(`Server running on port ${port}`));
  });
};

connectDB()
  .then(() => {
    initializeMiddleware(app);
    startServer();
    console.log(colors.green.underline("Alive and kicking!"));
  })
  .catch((err: Error) => {
    console.error(err.message);
  });

export default app;
