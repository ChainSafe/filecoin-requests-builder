import { sendRpcRequest } from './sendRpcRequest';

export type RpcContext = {
    ethAddress: string;
    ethBlockNumber: string;
    ethBlockHash: string;
    ethTransactionHash: string;
    ethZeroAddress: string;
    filecoinAddress: string;
    filecoinMinerId: string;
    filecoinActorId: string;
    filecoinTipsetHeight: number;
    filecoinTipsetKey: any[];
    filecoinMessageCid: { '/': string };
    filecoinMultisigAddress: string;
    ethContractAddress: string;
    ethContractCallData: string;
};

const MAINNET_MINER = 'f01000';
const TESTNET_MINER = 't01000';
const MAINNET_MULTISIG = 'f024757';
const TESTNET_MULTISIG = 't043496';
const MAINNET_CONTRACT = '0x0c1d86d34e469770339b53613f3a2343accd62cb';
const TESTNET_CONTRACT = '0x0c1d86d34e469770339b53613f3a2343accd62cb';
const MAINNET_CONTRACT_CALL_DATA = '0xf8b2cb4f000000000000000000000000cbff24ded1ce6b53712078759233ac8f91ea71b6';
const TESTNET_CONTRACT_CALL_DATA = '0xf8b2cb4f000000000000000000000000cbff24ded1ce6b53712078759233ac8f91ea71b6';
const ETH_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

async function findMultisigAddress(
    rpcUrl: string,
    candidates: string[]
): Promise<string> {
    for (const address of candidates) {
        try {
            const res = await sendRpcRequest(rpcUrl, {
                name: 'Filecoin.MsigGetAvailableBalance',
                params: [address, null],
            });

            if (res.body?.result !== undefined) {
                return address;
            }
        } catch (err) {
            console.log(`Address ${address} is not a valid multisig address:`, err);
        }
    }
    throw new Error('No valid multisig address found among candidates');
}

let cachedNetworkName: string | null = null;

async function getNetworkName(rpcUrl: string): Promise<string> {
    if (cachedNetworkName) {
        return cachedNetworkName;
    }
    const resNet = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.StateNetworkName',
        params: [],
    });

    const networkName = resNet.body.result;
    if (!networkName) {
        throw new Error('Failed to determine network name');
    }
    cachedNetworkName = networkName;
    return networkName;
}

async function getMinerId(rpcUrl: string): Promise<string> {
    const networkName = await getNetworkName(rpcUrl);

    if (networkName === 'mainnet') {
        return MAINNET_MINER;
    } else {
        return TESTNET_MINER;
    }
}

async function getContractAddress(rpcUrl: string): Promise<string> {
    const networkName = await getNetworkName(rpcUrl);
    if (networkName === 'mainnet') {
        return MAINNET_CONTRACT;
    } else {
        return TESTNET_CONTRACT;
    }
}

export async function getContractCallData(rpcUrl: string): Promise<string> {
    const networkName = await getNetworkName(rpcUrl);
    if (networkName === 'mainnet') {
        return MAINNET_CONTRACT_CALL_DATA;
    } else {
        return TESTNET_CONTRACT_CALL_DATA;
    }
}

export async function fetchRpcContext(rpcUrl: string): Promise<RpcContext> {
    const resBlock = await sendRpcRequest(rpcUrl, {
        name: 'eth_getBlockByNumber',
        params: ['latest', true],
    });

    const transactions = resBlock.body.result?.transactions || [];
    let ethAddress =
        transactions.find((tx: any) => tx?.from && !tx.from.startsWith('0xff'))?.from ??
        transactions[0]?.from;


    const ethTransactionHash = resBlock.body.result?.transactions?.[0]?.hash || resBlock.body.result?.transactions?.[0];
    if (!ethTransactionHash) {
        throw new Error('Failed to retrieve ETH transaction hash');
    }
    const blockHash = resBlock.body.result?.hash;

    const filecoinMinerId = await getMinerId(rpcUrl);

    const resTipset = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.ChainHead',
        params: [],
    });
    const filecoinTipsetHeight = resTipset.body.result?.Height;
    if (typeof filecoinTipsetHeight !== 'number') {
        throw new Error('Failed to retrieve Filecoin tipset height');
    }

    const filecoinTipsetKey = resTipset.body.result?.Cids;

    if (!filecoinTipsetKey || !Array.isArray(filecoinTipsetKey)) {
        throw new Error('Failed to retrieve Filecoin tipset key');
    }

    const resBlockNumber = await sendRpcRequest(rpcUrl, {
        name: 'eth_blockNumber',
        params: [],
    });
    const blockNumber = resBlockNumber.body.result;

    if (!blockHash) {
        throw new Error('Failed to retrieve latest ETH block hash');
    }

    const parentCid = filecoinTipsetKey?.[0];
    if (!parentCid) {
        throw new Error('Tipset block CID not found');
    }

    const resParentMessages = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.ChainGetParentMessages',
        params: [parentCid],
    });

    const actorAddrs: string[] = resParentMessages.body.result?.map((m: any) => m?.Message?.From);

    let filecoinActorId: string = '';
    let filecoinAddress: string = '';

    for (const addr of actorAddrs) {
        try {
            const res = await sendRpcRequest(rpcUrl, {
                name: 'Filecoin.StateLookupID',
                params: [addr, null],
            });

            if (typeof res.body.result === 'string' && res.body.result.startsWith('f0')) {
                filecoinActorId = res.body.result;
                filecoinAddress = addr;
                break;
            }
        } catch (err) {
            console.log('Error looking up ID for address', addr, ':', err);
            continue;
        }
    }

    const filecoinMessageCid = resParentMessages.body.result?.[0]?.Cid;
    if (!filecoinMessageCid) {
        throw new Error('Failed to retrieve Filecoin message CID');
    }

    const filecoinMultisigAddress = await findMultisigAddress(rpcUrl, [MAINNET_MULTISIG, TESTNET_MULTISIG]);

    return {
        ethAddress,
        ethZeroAddress: ETH_ZERO_ADDRESS,
        ethTransactionHash,
        filecoinAddress,
        filecoinMinerId,
        filecoinActorId,
        filecoinTipsetHeight,
        ethBlockNumber: blockNumber,
        ethBlockHash: blockHash,
        filecoinTipsetKey,
        filecoinMessageCid,
        filecoinMultisigAddress,
        ethContractAddress: await getContractAddress(rpcUrl),
        ethContractCallData: await getContractCallData(rpcUrl),
    };
}
