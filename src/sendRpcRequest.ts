export async function sendRpcRequest(url: string, method: { name: string; params: any[] }) {
    console.log(`Sending RPC request to ${url} with method ${method.name} and params:`, method.params);
    let res: Response;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: Math.floor(Math.random() * 100000),
                method: method.name,
                params: method.params
            })
        });
    } catch (error) {
        console.error(`Failed to send RPC request to ${url} with method ${method.name}:`, error);
        throw error;
    }

    let json: any;
    try {
        json = await res.json();
    } catch (error) {
        console.error(`Failed to parse JSON response from ${url} for method ${method.name}:`, error);
        throw error;
    }

    return { status: res.status, body: json };
}
