const Web3 = require("web3");
const abi = require("./abi.json");

const contractAddress = "0xc5a7126B74d801Ce84FABeF78B5cCf526812c597";

async function web3i() {
  const web3 = await new Web3(
    new Web3.providers.HttpProvider(
      "https://polygon-mumbai.g.alchemy.com/v2/jPePAlYUEHyZFuDev2yV7jeNYGFwxaQ4"
    )
  );

  const contractABI = abi;

  const contract = await new web3.eth.Contract(contractABI, contractAddress);

  return contract;
}

module.exports = web3i;
