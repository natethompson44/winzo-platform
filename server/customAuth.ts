import { Express, Request, Response } from "express";
import { authenticateUser, createUser } from "./auth";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export function registerCustomAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Create session token
      const sessionToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        ENV.jwtSecret,
        { expiresIn: "7d" }
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Login failed:", error);
      return res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.json({ success: true });
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const sessionCookie = req.cookies[COOKIE_NAME];

      if (!sessionCookie) {
        return res.json({ user: null });
      }

      const decoded = jwt.verify(sessionCookie, ENV.jwtSecret) as any;
      
      // Get fresh user data from database
      const { getUserById } = await import("./db");
      const user = await getUserById(decoded.userId);

      if (!user) {
        return res.json({ user: null });
      }

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          suspended: user.suspended,
        },
      });
    } catch (error) {
      return res.json({ user: null });
    }
  });
}
