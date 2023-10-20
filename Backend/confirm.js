const Web3 = require("web3");

async function confirm(tx) {
  const web3 = await new Web3(
    new Web3.providers.HttpProvider(
      "https://polygon-mumbai.g.alchemy.com/v2/jPePAlYUEHyZFuDev2yV7jeNYGFwxaQ4"
    )
  );

  const contractAddress = "0xc5a7126B74d801Ce84FABeF78B5cCf526812c597";
  const account = "0xB9B355d5eE9362c2A6E3ef2AB7985cbE3cd2A067";
  const gasPrice = await web3.eth.getGasPrice();

  const encodedTx = tx.encodeABI();

  const nonce = await web3.eth.getTransactionCount(account);

  const gasLimit = 1000000;

  const transactionObject = {
    nonce: web3.utils.toHex(nonce),
    from: account,
    to: contractAddress,
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(gasPrice),
    data: encodedTx,
  };

  const signedTransaction = await web3.eth.accounts.signTransaction(
    transactionObject,
    "f7c5186d5180c99d180ab10e804697fb1df89028ddb7270f0b27e91142ba7b3b"
  ); 

  const ok = await web3.eth.sendSignedTransaction(
    signedTransaction.rawTransaction
  );

  hash = signedTransaction.transactionHash;

  console.log("hash", hash);

  return hash;
}

module.exports = confirm;
