import * as w3 from '@solana/web3.js'


export const transferSOL = async (from, to, transferAmount) => {
    try {
        const connection = new w3.Connection(w3.clusterApiUrl('devnet'),'confirmed')
        const txn = new w3.Transaction().add(
            w3.SystemProgram.transfer({
                fromPubkey : new w3.PublicKey(from.publicKey.toString()),
                toPubkey : new w3.PublicKey(to.publicKey.toString()),
                lamports : transferAmount * w3.LAMPORTS_PER_SOL
            })
        )
        const signature = await w3.sendAndConfirmTransaction(
            connection,
            txn,
            [from]
        )
        return signature;

    }
    catch(err){
        console.error(`An error occurred during the transaction`)
    }
}

export const getWalletBalance = async (Public_Key) => {
    try{
        const connection = new w3.Connection(w3.clusterApiUrl('devnet'),'confirmed')
        const balance = await connection.getBalance(new w3.PublicKey(Public_Key))
        
        return balance/w3.LAMPORTS_PER_SOL;
    }
    catch(err){
        console.error(`ERROR : Cannot fetch user's wallet balance`)
    }
}

export const airDrop = async (wallet,transferAmount) => {
    try{
        const connection = new w3.Connection(w3.clusterApiUrl('devnet'),'confirmed')
        const airDropSignature = await connection.requestAirdrop(
            new w3.PublicKey(wallet.publicKey.toString()), 
            transferAmount * w3.LAMPORTS_PER_SOL
        )
        const latestBlockHash = await connection.getLatestBlockhash()
        await connection.confirmTransaction({
            blockhash : latestBlockHash.blockhash,
            lastValidBlockHeight : latestBlockHash.lastValidBlockHeight,
            signature : airDropSignature
        })
    }
    catch(err){
        console.error(`ERROR : Cannot airdrop SOL to the treasury wallet`)
    }
}

export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const totalAmountToBePaid = (investment) => {
    if(investment<=3){
        return investment + 0.03 * investment
    }else {
        return investment + 0.05 * investment
    }
}

export const getReturnAmount = (investment, stakeFactor) => {
    return investment*stakeFactor;
}

