import { serve } from "serve";
import { serveDir } from "serveDir";

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // /login → login/index.html を返す
  if (pathname.startsWith("/login")) {
    return serveDir(req, {
      fsRoot: "./login",
      urlRoot: "/login",
      showDirListing: true
    });
  }

  // /control → control/index.html を返す
  if (pathname.startsWith("/control")) {
    return serveDir(req, {
      fsRoot: "./control",
      urlRoot: "/control",
      showDirListing: true
    });
  }

  // その他はトップページやエラーページにリダイレクトするなど
  return new Response("404 Not Found", { status: 404 });
});
