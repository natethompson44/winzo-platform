import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@shared/const";
import { ENV } from "./env";
import { getUserById } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try custom JWT auth first
    const sessionCookie = opts.req.cookies[COOKIE_NAME];
    if (sessionCookie) {
      try {
        const decoded = jwt.verify(sessionCookie, ENV.jwtSecret) as any;
        if (decoded.userId) {
          const foundUser = await getUserById(decoded.userId);
          if (foundUser && foundUser.suspended === 1) {
            // User is suspended, don't authenticate
            user = null;
          } else {
            user = foundUser || null;
          }
        }
      } catch (jwtError) {
        // If JWT fails, try OAuth
        user = await sdk.authenticateRequest(opts.req);
      }
    } else {
      // No cookie, try OAuth
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
