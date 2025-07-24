import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRpcContext, getContractCallData } from '../src/fetchRpcContext';
import { sendRpcRequest } from '../src/sendRpcRequest';

vi.mock('../src/sendRpcRequest');
const mockedSendRpcRequest = sendRpcRequest as ReturnType<typeof vi.fn>;

describe('fetchRpcContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch full RPC context for mainnet', async () => {
    mockedSendRpcRequest.mockImplementation(async (_url, { name }) => {
      switch (name) {
        case 'Filecoin.StateNetworkName':
          return { body: { result: 'mainnet' } };
        case 'eth_getBlockByNumber':
          return {
            body: {
              result: {
                transactions: [{ from: '0xabc', hash: '0x123' }],
                hash: '0xblockHash',
              },
            },
          };
        case 'Filecoin.ChainHead':
          return {
            body: {
              result: {
                Height: 1000,
                Cids: [{ '/': 'bafy...' }],
              },
            },
          };
        case 'eth_blockNumber':
          return { body: { result: '0x100' } };
        case 'Filecoin.ChainGetParentMessages':
          return {
            body: {
              result: [{ Message: { From: 't1abc' }, Cid: { '/': 'bafymsgcid' } }],
            },
          };
        case 'Filecoin.StateLookupID':
          return { body: { result: 'f0123' } };
        case 'Filecoin.MsigGetAvailableBalance':
          return { body: { result: '1000' } };
        default:
          throw new Error('Unhandled RPC method: ' + name);
      }
    });

    const result = await fetchRpcContext('http://mocked');

    expect(result.ethAddress).toBe('0xabc');
    expect(result.ethZeroAddress).toBe('0x0000000000000000000000000000000000000000');
    expect(result.ethTransactionHash).toBe('0x123');
    expect(result.filecoinAddress).toBe('t1abc');
    expect(result.filecoinActorId).toBe('f0123');
    expect(result.filecoinTipsetHeight).toBe(1000);
    expect(result.ethBlockNumber).toBe('0x100');
    expect(result.ethBlockHash).toBe('0xblockHash');
    expect(result.filecoinTipsetKey).toEqual([{ '/': 'bafy...' }]);
    expect(result.filecoinMessageCid).toEqual({ '/': 'bafymsgcid' });
    expect(result.filecoinMultisigAddress).toBe('f024757');
    expect(result.ethContractAddress).toBe('0x0c1d86d34e469770339b53613f3a2343accd62cb');
    expect(result.ethContractCallData).toBe('0xf8b2cb4f000000000000000000000000cbff24ded1ce6b53712078759233ac8f91ea71b6');
  });

  it('should return mainnet call data', async () => {
    mockedSendRpcRequest.mockResolvedValueOnce({ body: { result: 'mainnet' } });

    const data = await getContractCallData('http://mocked');
    expect(data).toBe('0xf8b2cb4f000000000000000000000000cbff24ded1ce6b53712078759233ac8f91ea71b6');
  });
});
