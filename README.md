# filecoin-requests-builder

Generate real Filecoin and Ethereum JSON-RPC method definitions with up-to-date parameters from live chain state.

## ✨ Features

* 🔁 Automatically queries chain state to populate dynamic parameters
* 🔧 Allows manual override of parameters
* 🧩 Supports both Filecoin and Ethereum RPC methods
* 🧪 Suitable for use in benchmarks, simulations, or integration tests

---

## 🚀 Install

```bash
npm install filecoin-requests-builder
```

---

## 🛠 Usage

You can either **automatically fetch context** from an RPC endpoint, or manually provide parameters yourself.

### Option 1: Use live chain data (recommended)

```ts
import { fetchRpcContext, buildRequests } from 'filecoin-requests-builder';

const rpcUrl = 'https://fil-rpc.url';
const context = await fetchRpcContext(rpcUrl);
const requests = buildRequests(context);

// Call any method
e.g. sendRpcRequest(rpcUrl, {
  name: 'eth_getBalance',
  params: requests['eth_getBalance'].params
});
```

### Option 2: Provide your own context manually

```ts
import { buildRequests } from 'filecoin-requests-builder';

const context = {
  ethAddress: '0x1234...',
  ethZeroAddress: '0x0000000000000000000000000000000000000000',
  ethBlockHash: '0xabc...',
  ethTransactionHash: '0xdef...',
  filecoinAddress: 'f1xyz...',
  filecoinActorId: 'f01234',
  filecoinTipsetHeight: 123456,
  filecoinMinerId: 'f01234'
};

const requests = buildRequests(context);
```

---

## 📚 API

### `fetchRpcContext(rpcUrl: string): Promise<RpcContext>`

Fetches current addresses, IDs, and block data to use in JSON-RPC method definitions.

### `buildRequests(context: RpcContext): RpcMethodMap`

Returns an object where each key is a method name (e.g. `eth_getBalance`) and the value is:

```ts
{ params: any[] }
```
