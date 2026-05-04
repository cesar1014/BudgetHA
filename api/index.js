import { createServerApp } from "../server.js";

let appPromise;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = createServerApp();
  }

  const app = await appPromise;
  return app(req, res);
}
