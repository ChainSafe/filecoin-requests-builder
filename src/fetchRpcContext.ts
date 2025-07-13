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
    filecoinMessageCid: {'/': string};
};

export async function fetchRpcContext(rpcUrl: string): Promise<RpcContext> {
    const ethZeroAddress = '0x0000000000000000000000000000000000000000';
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

    const resMiners = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.StateListMiners',
        params: [null],
    });
    const filecoinMinerId = resMiners.body.result?.[0];
    if (!filecoinMinerId) {
        throw new Error('Failed to retrieve Filecoin miner id');
    }

    const actorsRes = await sendRpcRequest(rpcUrl, {
        name: "Filecoin.StateListActors",
        params: [null],
    });
    const actorIds: string[] = actorsRes.body.result;

    // filter ID-accounts (f0/t0)
    const idActors = actorIds.filter(id => /^([ft])0[0-9]+$/.test(id));

    const randomActorId = idActors[0];
    const keyRes = await sendRpcRequest(rpcUrl, {
        name: "Filecoin.StateAccountKey",
        params: [randomActorId, null],
    });
    const filecoinAddress = keyRes.body.result;

    const resActor = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.StateLookupID',
        params: [filecoinAddress, null],
    });
    const filecoinActorId = resActor.body.result;
    if (!filecoinActorId) {
        throw new Error('Failed to retrieve Filecoin actor id');
    }
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

    const filecoinMessageCid = resParentMessages.body.result?.[0]?.Cid;
    if (!filecoinMessageCid) {
        throw new Error('Failed to retrieve Filecoin message CID');
    }

    return {
        ethAddress,
        ethZeroAddress,
        ethTransactionHash,
        filecoinAddress,
        filecoinMinerId,
        filecoinActorId,
        filecoinTipsetHeight,
        ethBlockNumber: blockNumber,
        ethBlockHash: blockHash,
        filecoinTipsetKey,
        filecoinMessageCid
    };
}
