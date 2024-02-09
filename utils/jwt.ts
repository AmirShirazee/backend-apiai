import { Request } from "express";
const jwt = require("express-jwt");

const jwtMiddleware = jwt({
  secret: process.env.NEXTAUTH_SECRET as string,
  algorithms: ["HS256"],
  getToken: (req: Request) => {
    const authHeader = req.headers.authorization;
    return authHeader?.split(" ")[1];
  },
});

export default jwtMiddleware;
