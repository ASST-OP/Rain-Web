import { loginWithPassword } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

// セッション情報を一時保存するメモリDB
const pendingLoginMap = new Map<string, {
  email: string;
  password: string;
  device: string;
  pincode?: string;
  storagePath: string;
}>();

export function getPendingLogin(sessionId: string) {
  return pendingLoginMap.get(sessionId);
}
export function deletePendingLogin(sessionId: string) {
  pendingLoginMap.delete(sessionId);
}

export async function loginHandler(req: Request): Promise<Response> {
  const { email, password, device } = await req.json();
  if (!email || !password || !device) {
    return new Response(JSON.stringify({ error: "全てのフィールドを入力してください" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const storagePath = join(".", "tmp", `session_${Date.now()}.json`);
  let capturedPincode = "";

  try {
    await loginWithPassword(
      { email, password, device, onPincodeRequest(pin) {
        capturedPincode = pin;
      }},
      { device, storage: new FileStorage(storagePath) }
    );
  } catch (_) {
    // 無視：PINコード要求時に止まる
  }

  if (!capturedPincode) {
    return new Response(JSON.stringify({ error: "PINコードの取得に失敗しました" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sessionId = crypto.randomUUID();
  pendingLoginMap.set(sessionId, { email, password, device, pincode: capturedPincode, storagePath });

  return new Response(JSON.stringify({ sessionId, pincode: capturedPincode }), {
    headers: { "Content-Type": "application/json" },
  });
}
