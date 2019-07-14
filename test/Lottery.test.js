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
});