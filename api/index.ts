import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/createApp";

let app: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!app) app = createApp();
  return app;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  return getApp()(req, res);
}
