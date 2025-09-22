import type { Application } from "express-serve-static-core";

export async function registerRoutes(app: Application) {
  // define routes here
  const server = app.listen(0); // or however you boot the server
  return server;
}
