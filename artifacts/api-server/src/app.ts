import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import { parseCorsAllowlist, isAllowedOrigin } from "./lib/corsPolicy";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import { devAuthMiddleware } from "./middlewares/devAuthMiddleware";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app: Express = express();

// Behind Replit's autoscale proxy: trust one hop so req.ip / rate-limit keys
// and secure cookies reflect the real client, not the proxy.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Security headers. CSP is left to the web tier (this server returns JSON);
// keep the API readable cross-origin by the web app.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// CORS: reflect only allow-listed origins — never blanket-reflect with
// credentials. Production must set CORS_ORIGINS (comma-separated); dev defaults
// to the local web dev server so the split :3100 web / :8080 API works with no env.
const configuredOrigins = parseCorsAllowlist(process.env.CORS_ORIGINS);
const corsAllowlist =
  configuredOrigins.length > 0
    ? configuredOrigins
    : process.env.NODE_ENV === "production"
      ? []
      : [
          "http://localhost:3100",
          "http://127.0.0.1:3100",
          "http://localhost:8080",
        ];

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      cb(null, isAllowedOrigin(origin, corsAllowlist));
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public health check — mounted BEFORE auth so deploy/autoscale probes never
// depend on Clerk configuration. Must stay ahead of clerkMiddleware.
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// Rate limiting — after the public health check so autoscale probes are never
// throttled, and before auth so it also shields the auth handshake. Keyed by
// client IP (trust proxy is set above).
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
// Tighter cap on the email IMAP/SMTP surface (brute-force / abuse).
const emailLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
app.use("/api/email", emailLimiter);
app.use("/api", apiLimiter);

// In development without Clerk keys, fall back to a mock signed-in user so the
// app is runnable locally with no secrets. Production (and any env that sets
// CLERK_SECRET_KEY) always uses the real Clerk middleware — behavior unchanged.
const useDevAuth =
  process.env.NODE_ENV === "development" && !process.env.CLERK_SECRET_KEY;

if (useDevAuth) {
  logger.warn(
    "DEV AUTH FALLBACK active: all requests run as a mock user (no Clerk keys). Never use in production.",
  );
  app.use(devAuthMiddleware);
} else {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
}

app.use("/api", router);

// Any unmatched /api route → 404 JSON (kept before the error handler).
app.use("/api", notFoundHandler);

// Last-resort error handler — consistent { error } shape, never hangs.
app.use(errorHandler);

export default app;
