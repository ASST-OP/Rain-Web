import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);

  // APIルーティング（/api/... の処理をapi.tsに委譲）
  if (url.pathname.startsWith("/api/")) {
    const { handleApi } = await import("./routes/api.ts");
    return await handleApi(req);
  }

  // 静的ファイル配信（/control, /login 含む）
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    showDirListing: true,
  });
});
