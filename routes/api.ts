export async function handleApi(req: Request): Promise<Response> {
  const { action, token, squareChatMid, text } = await req.json();

  switch (action) {
    case "squares":
      // LINEの非公開API呼び出しをここで実行
      return Response.json({ result: [] }); // ダミー
    case "send":
      return Response.json({ message: "送信成功" });
    default:
      return new Response("不正なアクション", { status: 400 });
  }
}
