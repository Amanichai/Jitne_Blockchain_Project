const sha256 = require('sha256');
const uuid = require('uuid/v4');
const currentNodeUrl = process.argv[3]

class Blockchain {
    constructor(){
        this.chain = [];
        this.pendingTransactions = [];

        this.currentNodeUrl = currentNodeUrl;
        this.networkNode = [];

        this.createNewBlock(11, '0', '0')
    }
    // CREATE A NEW BLOCK
    createNewBlock = (nonce, previousBlockHash, hash) =>{
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce,
            previousBlockHash,
            hash
        }
        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }
    // GET THE LAST BLOCK IN CHAIN
    getLastBlock = ()=>{
        return this.chain[this.chain.length - 1];
    }
    //CREATE A NEW TRANSACTION
    createNewTransaction = (amount, sender, recipient)=>{
        const newTransaction = {
            amount,
            sender,
            recipient,
            transactionId: uuid().split('-').join('')
        }
        return newTransaction;
    }
    //ADD TRANSACTIONS TO BLOCK
    addToPendingTransactions =(transactionObj)=>{
        this.pendingTransactions.push(transactionObj);
        return this.getLastBlock()['index'] + 1;
    }
    // CREATE A HASH FOR BLOCK
    hashBlock = (previousBlockHash, currentBlockData, nonce) =>{
        const dataToString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataToString);

        return hash;
    }
    // MINE A BLOCK
    proofOfWork = (previousBlockHash, currentBlockData)=>{
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        while(hash.substring(0,4) !== '0000'){
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }

        return hash;
    }
    //CHECK IF CHAIN IS VALID
    chainIsValid = (blockchain)=>{
        let validChain = true;

        const genesisBlock = blockchain[0];
        const correctGenNonce = genesisBlock['nonce'] === 111;
        const correctGenPrevHash = genesisBlock['previousBlockHash'] === '0';
        const correctGenHash = genesisBlock['hash'] === '0';
        const correctGenTransactionID = genesisBlock['transactionID'] === 0;
        if(!correctGenNonce || !correctGenPrevHash || !correctGenHash || !correctGenTransactionID) validChain = false

        for(i=1;1<blockchain.chain.length;i++){
            const currentBlock = blockchain.chain[i];
            const lastBlock = blockchain.chain[i-1];
            const blockHash = this.hashBlock(lastBlock['hash'], {transactions: currentBlock['transactions'], index: currentBlock['index']}, currentBlock['nonce']);
            if(blockHash.substring(0,4) !== '0000') validChain = false;
            if(currentBlock['previousBlockHash'] !== lastBlock['hash']) validChain = false
        }
        
        return validChain;
    }
    //GET BLOCK BY HASH
    getBlock = (blockHash)=>{
        let correctBlock = null;
        this.chain.forEach(block =>{
            if(block.hash === blockHash) correctBlock = block
        });
        
        return correctBlock;
    }
    // GET TRANSACATION FROM ID
    getTransactionId = (transactionId)=>{
        let correctTransaction = null;
        let correctBlock = null;
        this.chain.forEach(block=>{
            block.transactions.forEach(transaction =>{
                if(transaction.transactionId === transactionId){
                    correctTransaction = transaction;
                    correctBlock = block;
                }
            });
        });

        return {
            transaction: correctTransaction,
            block: correctBlock
        }
    }
    // PULL UP ALL TRANSACTIONS OF A PARTICULAR ADDRESS
    getAddress = (address) =>{
        const addressTransactions = []
        this.chain.forEach(block=>{
            block.transactions.forEach(transaction =>{
                if(transaction.sender === addresss || transaction.recipient === address){
                    addressTransactions.push(transaction)
                }
            });
        });
        balance = 0;
        addressTransactions.forEach(transaction =>{
            if(transaction.recipient === address) balance += transaction.amount;
            if(transaction.sender === address) balance -= transaction.amount;
        });
        return {
            Transaction: addressTransactions,
            Total: balance
        }
    }
}

module.exports = Blockchain;