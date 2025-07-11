export async function sendRpcRequest(url: string, method: { name: string; params: any[] }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Math.floor(Math.random() * 100000),
      method: method.name,
      params: method.params
    })
  });

  const json = await res.json();
  return { status: res.status, body: json };
}
