import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";

// Helper to safely get the current working directory
function getCwd(): string {
  const cwd = process.cwd();
  if (!cwd || typeof cwd !== "string") {
    // Fallback to /app which is Railway's default working directory
    return "/app";
  }
  return cwd;
}


export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // Let Vite load the config file itself - this avoids importing vite.config.ts
  // which uses import.meta.dirname that doesn't work in bundled code
  const cwd = getCwd();
  const vite = await createViteServer({
    configFile: path.resolve(cwd, "vite.config.ts"),
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // process.cwd() is the project root, so client/index.html is directly accessible
      const cwd = getCwd();
      const clientTemplate = path.resolve(cwd, "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, always use process.cwd() - never try import.meta in production code
  // The dist/public folder is at the project root
  const cwd = getCwd();
  const distPath = path.resolve(cwd, "dist", "public");
    
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!indexPath) {
      res.status(500).send("Internal server error: Could not resolve index.html path");
      return;
    }
    res.sendFile(indexPath);
  });
}
