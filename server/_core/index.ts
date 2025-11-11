import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerCustomAuthRoutes } from "../customAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startOddsSyncScheduler } from "../oddsSync";
import { startScoreSyncScheduler } from "../scoreSync";
import { ENV } from "./env";
import { runMigrations } from "./migrate";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Run database migrations first - CRITICAL: must complete before server starts
  console.log("=".repeat(80));
  console.log("[Server] 🚀 SERVER STARTING - RUNNING MIGRATIONS FIRST");
  console.log("=".repeat(80));
  
  try {
    console.log("[Server] 🔄 Initializing database migrations...");
    await runMigrations();
    console.log("[Server] ✅ Migrations complete, starting server...");
  } catch (error: any) {
    console.error("=".repeat(80));
    console.error("[Server] ❌❌❌ CRITICAL: Migration failed - SERVER WILL NOT START ❌❌❌");
    console.error("[Server] Error:", error?.message || error);
    console.error("[Server] Stack:", error?.stack);
    console.error("=".repeat(80));
    // DON'T start the server if migrations fail - this is critical
    throw error;
  }

  const app = express();
  const server = createServer(app);
  
  // Configure CORS
  app.use(cors({
    origin: ENV.corsOrigin,
    credentials: true,
  }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback (only if OAuth is configured)
  // Note: OAuth routes are registered but won't work without OAUTH_SERVER_URL
  if (ENV.oAuthServerUrl) {
    registerOAuthRoutes(app);
  }
  
  // Custom username/password auth routes (primary authentication method)
  registerCustomAuthRoutes(app);
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
  // Start odds sync scheduler
  startOddsSyncScheduler();
  
  // Start score sync scheduler
  startScoreSyncScheduler();
  });
}

startServer().catch(console.error);
