const express = require('express');
app = express();

const bodyParser = require('body-parser');
const Blockchain = require('./blockchain')
const uuid = require('uuid/v4');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const jitne = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/blockchain', (req, res)=>{
    res.send(jitne);
});

app.post('/transaction', (req, res) =>{
    const newTransactions = req.body;
    const blockIndex = jitne.addToPendingTransactions(newTransactions);
    res.json({
        note: `Your transactions have been received and will be placed on ${blockIndex}...`
    });
});

app.post('/transaction-broadcast', (req, res) =>{
    const newTransactions = jitne.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    jitne.addToPendingTransactions(newTransactions);

    const requestPromises = []
    jitne.networkNode.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransactions,
            json: true
        }
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data=>{
        res.json({
            note: `Your transaction has been accepted and broadcast successfully...`
        });
    })
})


app.listen(port, ()=>{
    console.log(`We doing this thang on ${port}!!`);
})