const assert = require('assert');
const ganache = require('ganache-cli');
const { interface, bytecode } = require('../compile');// import interface and bytecode

const Web3 = require('web3');//UpperCase Web3 is the constructor
const OPTIONS = {
    defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};
const provider = ganache.provider();
const web3 = new Web3(provider, null, OPTIONS);

let accounts;
let lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether')
        });

        const players = await lottery.methods.getPlayer().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });
});
describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
    
    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02','ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02','ether')
        });
    
        const players = await lottery.methods.getPlayer().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });
    it('only manager can pick a winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],//not the manager account
            });
            assert(false);//if we get to this line of code, them fail the test
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')
        });
                
        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;
        assert(difference > 1.8);
    });
});
