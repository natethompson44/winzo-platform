import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Get __dirname equivalent for ESM
// In production/bundled code, always use process.cwd() since import.meta may not work
const getDirname = () => {
  // In production, always use process.cwd()
  if (process.env.NODE_ENV === "production") {
    return process.cwd();
  }
  
  // In development, try to use import.meta.dirname, but fall back to process.cwd()
  try {
    // @ts-ignore - import.meta may not exist in some environments
    if (typeof import.meta !== "undefined" && typeof import.meta.dirname !== "undefined") {
      // @ts-ignore
      return import.meta.dirname;
    }
  } catch {
    // Ignore
  }
  
  // Fallback to process.cwd() - works in all cases
  return process.cwd();
};

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        getDirname(),
        "../..",
        "client",
        "index.html"
      );

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
  // In production, the dist/public folder is relative to the built index.js location
  // Use process.cwd() since import.meta.dirname may not work in bundled code
  const distPath = process.env.NODE_ENV === "development"
    ? path.resolve(getDirname(), "../..", "dist", "public")
    : path.resolve(process.cwd(), "dist", "public");
    
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
