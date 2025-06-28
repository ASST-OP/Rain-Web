import { loginWithPassword } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import { kv } from "./kv.ts";
import type { RequestHandler } from "./types.ts";

// 前の login.ts と共有
declare const pending: Map<string, any>;

export const pinHandler: RequestHandler = async (req) => {
  const { sessionId, pincode } = await req.json();
  const info = pending.get(sessionId);
  if (!info || info.pincode !== pincode) return Response.json({ error: "セッションまたはPINが一致しません" }, { status: 400 });

  const { email, password, device, clientStoragePath } = info;

  const client = await loginWithPassword({ email, password, device, pincode }, { device, storage: new FileStorage(clientStoragePath) });
  const authToken = client.authToken;
  const refreshToken = await client.base.storage.get("refreshToken");
  const mid = client.profile!.mid;

  // KVに保存（mid重複回避）
  const key = `user:${mid}`;
  const prev = await kv.get(key);
  if (!prev.value) {
    await kv.set(key, { authToken, refreshToken, mid });
  }

  pending.delete(sessionId);
  const redirectUrl = `/control/index.html?token=${encodeURIComponent(authToken)}&refreshToken=${encodeURIComponent(refreshToken!)}`;
  return Response.json({ url: redirectUrl });
};
