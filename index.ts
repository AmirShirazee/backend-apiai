import express, { Express, Request, Response, NextFunction } from "express";
import colors from "colors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initRoutes } from "./routes";
import { initRateLimit } from "./startup/rate-limit";
import { isProduction } from "./utils/isProd";
import connectDB from "./db/mongo";

const port = 3000;
const app: Express = express();
app.set("trust proxy", 1);

// const allowedIPs: string[] = ["217.123.79.176", "172.31.35.192"];

// const ipWhitelistMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const clientIP = req.ip;
//
//   if (allowedIPs.includes(<string>clientIP)) {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied" });
//   }
// };

const initializeMiddleware = (app: Express) => {
  // app.use(ipWhitelistMiddleware);

  initRateLimit(app);

  app.use(
    cors({
      origin: isProduction
        ? "https://testopenapi.com"
        : "http://localhost:8080",
      credentials: true,
    }),
  );

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
