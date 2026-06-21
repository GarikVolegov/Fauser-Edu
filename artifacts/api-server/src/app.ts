import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import { devAuthMiddleware } from "./middlewares/devAuthMiddleware";

const app: Express = express();

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

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public health check — mounted BEFORE auth so deploy/autoscale probes never
// depend on Clerk configuration. Must stay ahead of clerkMiddleware.
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

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

export default app;
