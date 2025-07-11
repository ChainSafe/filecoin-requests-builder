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
};

export async function fetchRpcContext(rpcUrl: string): Promise<RpcContext> {
    const ethZeroAddress = '0x0000000000000000000000000000000000000000';
    const resEthAccounts = await sendRpcRequest(rpcUrl, {
        name: 'eth_accounts',
        params: [],
    });
    const ethAddress = resEthAccounts.body.result?.[0];
    console.log('response', resEthAccounts);
    if (!ethAddress) {
        throw new Error('Failed to retrieve ETH address');
    }

    const resBlock = await sendRpcRequest(rpcUrl, {
        name: 'eth_getBlockByNumber',
        params: ['latest', true],
    });
    const ethTransactionHash = resBlock.body.result?.transactions?.[0]?.hash || resBlock.body.result?.transactions?.[0];
    if (!ethTransactionHash) {
        throw new Error('Failed to retrieve ETH transaction hash');
    }
        const blockHash = resBlock.body.result?.hash;


    const resFilecoinWallet = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.WalletList',
        params: [],
    });
    const filecoinAddress = resFilecoinWallet.body.result?.[0];
    if (!filecoinAddress) {
        throw new Error('Failed to retrieve Filecoin address');
    }

    const resMiners = await sendRpcRequest(rpcUrl, {
        name: 'Filecoin.StateListMiners',
        params: [null],
    });
    const filecoinMinerId = resMiners.body.result?.[0];
    if (!filecoinMinerId) {
        throw new Error('Failed to retrieve Filecoin miner id');
    }

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

    const resBlockNumber = await sendRpcRequest(rpcUrl, {
        name: 'eth_blockNumber',
        params: [],
    });
    const blockNumber = resBlockNumber.body.result;

    if (!blockHash) {
        throw new Error('Failed to retrieve latest ETH block hash');
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
    };
}
