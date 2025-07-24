import { describe, it, expect } from 'vitest';
import { buildRequests } from '../src/buildRequests';
import type { RpcContext } from '../src/fetchRpcContext';

describe('buildRequests – full coverage', () => {
  const mockContext: RpcContext = {
    ethAddress: '0xabc',
    ethBlockNumber: '0x1a',
    ethBlockHash: '0xblockhash',
    ethTransactionHash: '0xtxhash',
    ethZeroAddress: '0x0000000000000000000000000000000000000000',
    filecoinAddress: 'f1xyz',
    filecoinMinerId: 'f01234',
    filecoinActorId: 'f09999',
    filecoinTipsetHeight: 12345,
    filecoinTipsetKey: [{ '/': 'bafykey1' }],
    filecoinMessageCid: { '/': 'bafymsgcid' },
    filecoinMultisigAddress: 'f024757',
    ethContractAddress: '0xcontract',
    ethContractCallData: '0xcalldata',
  };

  const requests = buildRequests(mockContext);

  it('includes all expected methods', () => {
    const expectedMethods = [
      "Filecoin.ChainHead",
      "Filecoin.StateMinerPower",
      "Filecoin.StateMinerInfo",
      "eth_chainId",
      "eth_call",
      "eth_gasPrice",
      "eth_getBalance",
      "eth_getBlockByNumber",
      "eth_blockNumber",
      "eth_getLogs",
      "eth_getTransactionReceipt",
      "eth_getBlockByHash",
      "Filecoin.ChainGetTipSetByHeight",
      "Filecoin.WalletBalance",
      "Filecoin.StateMinerPartitions",
      "eth_getTransactionByHash",
      "eth_getBlockReceipts",
      "Filecoin.StateLookupID",
      "eth_feeHistory",
      "Filecoin.ChainGetParentReceipts",
      "Filecoin.ChainGetParentMessages",
      "Filecoin.ChainGetTipSet",
      "net_version",
      "eth_getTransactionCount",
      "Filecoin.ChainReadObj",
      "eth_maxPriorityFeePerGas",
      "eth_getStorageAt",
      "eth_estimateGas",
      "Filecoin.StateSearchMsg",
      "Filecoin.MsigGetAvailableBalance",
      "Filecoin.StateMinerSectorCount",
      "Filecoin.StateMinerSectors",
      "Filecoin.ChainGetGenesis",
      "Filecoin.MsigGetPending",
      "Filecoin.StateCall",
      "web3_clientVersion",
      "Filecoin.MpoolGetNonce",
      "Filecoin.StateVerifiedClientStatus",
      "Filecoin.EthGetMessageCidByTransactionHash",
      "Filecoin.GasEstimateMessageGas",
      "eth_syncing",
      "Filecoin.StateNetworkName",
      "eth_getCode",
      "Filecoin.StateMinerAvailableBalance"
    ];
    expect(Object.keys(requests).sort()).toEqual(expectedMethods.sort());
  });

  it('uses all context fields', () => {
    const usedKeys = new Set<string>();
    const jsonDump = JSON.stringify(requests);
    for (const key of Object.keys(mockContext)) {
      const value = (mockContext as any)[key];
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          if (value.length && JSON.stringify(value[0]) && jsonDump.includes(JSON.stringify(value[0]))) {
            usedKeys.add(key);
          }
        } else {
          if (jsonDump.includes(JSON.stringify(value))) {
            usedKeys.add(key);
          }
        }
      } else {
        if (jsonDump.includes(String(value))) {
          usedKeys.add(key);
        }
      }
    }
    expect([...usedKeys].sort()).toEqual(Object.keys(mockContext).sort());
  });

  it('includes correct nested structure in GasEstimateMessageGas', () => {
    const gasParams = requests["Filecoin.GasEstimateMessageGas"].params[0];
    expect(gasParams.To).toBe(mockContext.filecoinActorId);
    expect(gasParams.From).toBe(mockContext.filecoinAddress);
  });

  it('uses correct eth_call formatting', () => {
    const callParams = requests["eth_call"].params[0];
    expect(callParams.data).toBe(mockContext.ethContractCallData);
    expect(callParams.to).toBe(mockContext.ethContractAddress);
    expect(callParams.from).toBe(mockContext.ethAddress);
  });

  it('verifies block references are consistent', () => {
    expect(requests["eth_getBlockByHash"].params[0]).toBe(mockContext.ethBlockHash);
    expect(requests["eth_getBlockReceipts"].params[0]).toBe(mockContext.ethBlockNumber);
  });
});
