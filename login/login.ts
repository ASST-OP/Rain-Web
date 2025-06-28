import { loginWithPassword } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import type { RequestHandler } from "./types.ts";

interface Pending {
  email: string;
  password: string;
  device: string;
  pincode?: string;
  clientStoragePath: string;
}

const pending = new Map<string, Pending>(); // トークン生成まで一時保存

export const loginHandler: RequestHandler = async (req) => {
  const { email, password, device } = await req.json();
  const clientStoragePath = `./storage_${Date.now()}.json`;
  let capturedPincode: string | undefined;

  try {
    await loginWithPassword(
      { email, password, device, onPincodeRequest(pincode) {
        capturedPincode = pincode;
      }},
      { device, storage: new FileStorage(clientStoragePath) }
    );
  } catch {
    // onPincodeRequestで処理される
  }

  if (!capturedPincode) {
    return new Response(JSON.stringify({ error: "PINコード取得失敗" }), { status: 500 });
  }

  const sessionId = crypto.randomUUID();
  pending.set(sessionId, { email, password, device, pincode: capturedPincode, clientStoragePath });
  return Response.json({ sessionId, pincode: capturedPincode });
};
