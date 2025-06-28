import { loginWithPassword } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";
import type { RequestHandler } from "./types.ts";

export const loginHandler: RequestHandler = async (req) => {
  const { email, password, device } = await req.json();
  let capturedPincode = null;

  const client = await loginWithPassword(
    { email, password, device, onPincodeRequest(pincode) {
      capturedPincode = pincode;
    }},
    { device, storage: new FileStorage("./storage.json") }
  ).catch((e) => {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  });

  if (capturedPincode) {
    return new Response(JSON.stringify({ pincode: capturedPincode }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "PINコード送出失敗" }), { status: 500 });
};
