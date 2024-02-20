import express, { Express, Request, Response, NextFunction } from "express";
import colors from "colors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import { initRoutes } from "./routes";
import { initRateLimit } from "./startup/rate-limit";
import { isProduction } from "./utils/isProd";
import connectDB from "./db/mongo";
import userAuthorizationMiddleware from "./middleware/auth";

const port = 3000;
const app: Express = express();

app.set("trust proxy", 1);
app.get("/backend/api/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running!" });
});

app.use(userAuthorizationMiddleware);
const allowedOrigins = ["http://localhost:8080", "https://testopenapi.com"];
const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
};
const initializeMiddleware = (app: Express) => {
  initRateLimit(app);

  app.use(cors(corsOptions));

  app.use(cookieParser("secret-cookie"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan(isProduction ? "combined" : "dev"));

  initRoutes(app);
};

const startServer = () => {
  app.listen(port, (): void => {
    console.log(colors.green.underline(`Server running on port ${port}`));
  });
};

connectDB()
  .then(() => {
    initializeMiddleware(app);
    startServer();
  })
  .catch((err: Error) => {
    console.error(err.message);
  });

export default app;
