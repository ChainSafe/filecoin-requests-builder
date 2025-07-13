import { RpcContext } from './fetchRpcContext';

export type RpcMethodMap = Record<string, { params: any[] }>;

/**
 * Builds a map of JSON-RPC method definitions with resolved parameters.
 */
export function buildRequests(context: RpcContext): RpcMethodMap {
  return {
    "Filecoin.ChainHead": { params: [] },
    "Filecoin.StateMinerPower": { params: [context.filecoinMinerId, []] },
    "Filecoin.StateMinerInfo": { params: [context.filecoinMinerId, []] },
    // "Filecoin.StateMarketStorageDeal": { params: [109704581, []] },
    "eth_chainId": { params: [] },
    // "eth_call": {
    //   params: [
    //     {
    //       data: "0xf8b2cb4f000000000000000000000000cbff24ded1ce6b53712078759233ac8f91ea71b6",
    //       from: context.ethAddress,
    //       gas: "0x0",
    //       gasPrice: "0x0",
    //       to: "0x0c1d86d34e469770339b53613f3a2343accd62cb",
    //       value: "0x0",
    //     },
    //     "latest",
    //   ],
    // },
    "eth_gasPrice": { params: [] },
    "eth_getBalance": { params: [context.ethAddress, "latest"] },
    "eth_getBlockByNumber": { params: ["latest", false] },
    "eth_blockNumber": { params: [] },
    "eth_getLogs": { params: [{ fromBlock: "latest", address: context.ethZeroAddress }] },
    "eth_getTransactionReceipt": { params: [context.ethTransactionHash] },
    "eth_getBlockByHash": { params: [context.ethBlockHash, false] },
    "Filecoin.ChainGetTipSetByHeight": { params: [context.filecoinTipsetHeight, null] },
    "Filecoin.WalletBalance": { params: [context.filecoinAddress] },
    "Filecoin.StateMinerPartitions": { params: [context.filecoinMinerId, 0, null] },
    "eth_getTransactionByHash": { params: [context.ethTransactionHash] },
    "eth_getBlockReceipts": { params: [context.ethBlockNumber] },
    "Filecoin.StateLookupID": {
      params: [
        context.filecoinAddress,
        context.filecoinTipsetKey
      ]
    },
    "eth_feeHistory": { params: ["0x4", "latest", [25, 50, 75]] }, // 0x4 = blocks count
    "Filecoin.ChainGetParentReceipts": {
      params: [context.filecoinTipsetKey[0]],
    },
    "Filecoin.ChainGetParentMessages": {
      params: [context.filecoinTipsetKey[0]],
    },
    "Filecoin.ChainGetTipSet": {
      params: [context.filecoinTipsetKey],
    },
    "net_version": { params: [] },
    "eth_getTransactionCount": { params: [context.ethAddress, "latest"] },
    // "Filecoin.ChainReadObj": {
    //   params: [{ "/": "bafy2bzacecdcexybh5urgevm3vsqypphvtaphfkbrp5ypailznwsesxex4inc" }],
    // },
    "eth_maxPriorityFeePerGas": { params: [] },
    "eth_getStorageAt": { params: [context.ethAddress, "0x0", "latest"] },
    "eth_estimateGas": {
      params: [
        {
          from: context.ethAddress,
          to: context.ethAddress,
          value: "0x0",
          data: "0x",
        },
      ],
    },
    // "Filecoin.StateSearchMsg": {
    //   params: [
    //     [
    //       { "/": "bafy2bzacec2pdpnwwznkbm44dl7ehuyqu5igtupo7r5ejgmvvnrjiywaauhaw" },
    //       { "/": "bafy2bzaceb6dxlcrvo27q5zycy7tizq7n7nhf3bm7vrijm56lugxj6fpbbfs4" }
    //     ],
    //     { "/": "bafy2bzacec3gjsesbbztd5qcchskbwvhixdyigrrbseztoisknh5t5alwpuua" },
    //     3000,
    //     true
    //   ]
    // },
    // "Filecoin.MsigGetAvailableBalance": { params: ["f024757", null] },
    "Filecoin.StateMinerSectorCount": { params: [context.filecoinMinerId, []] },
    "Filecoin.StateMinerSectors": { params: [context.filecoinMinerId, [], []] },
    "Filecoin.ChainGetGenesis": { params: [] },
    // "Filecoin.MsigGetPending": { params: ["f024757", null] },
    "Filecoin.StateCall": {
      params: [
        {
          To: context.filecoinActorId,
          From: context.filecoinActorId,
          Value: "0",
          Method: 0,
          Params: "",
        },
        [],
      ],
    },
    "web3_clientVersion": { params: [] },
    "Filecoin.MpoolGetNonce": { params: [context.filecoinActorId] },
    "Filecoin.StateVerifiedClientStatus": { params: [context.filecoinActorId, []] },
    "Filecoin.EthGetMessageCidByTransactionHash": {
      params: [context.ethTransactionHash],
    },
    "Filecoin.GasEstimateMessageGas": {
      params: [
        {
          Version: 0,
          To: context.filecoinActorId,
          From: context.filecoinAddress,
          Nonce: 0,
          Value: "1000000000000000000",
          GasLimit: 0,
          GasFeeCap: "0",
          GasPremium: "0",
          Method: 0,
          Params: "",
        },
        { MaxFee: "5000000000000000000" },
        null,
      ],
    },
    "eth_syncing": { params: [] },
    "Filecoin.StateNetworkName": { params: [] },
    "eth_getCode": { params: [context.ethAddress, "latest"] },
    "Filecoin.StateMinerAvailableBalance": { params: [context.filecoinActorId, []] },
  };
}
