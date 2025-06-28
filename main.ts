import { serve } from "https://deno.land/std/http/server.ts";
import { serveDir } from "https://deno.land/std/http/file_server.ts";
import { loginHandler } from "./routes/login.ts";
import { pinHandler } from "./routes/pin.ts";

serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "POST" && url.pathname === "/api/login") return await loginHandler(req);
  if (req.method === "POST" && url.pathname === "/api/pin")   return await pinHandler(req);
  return serveDir(req, { fsRoot: ".", showDirListing: false });
});
