const {
  Asset,
  Keypair,
  Networks,
  Horizon,
  TransactionBuilder,
  Operation,
} = require('@stellar/stellar-sdk');
require('dotenv').config();

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

async function issueAsset(assetCode, amount) {
  const issuerKeys = Keypair.fromSecret(process.env.ISSUER_SECRET_KEY);
  const distributorKeys = Keypair.fromSecret(process.env.DISTRIBUTOR_SECRET_KEY);

  const skinAsset = new Asset(assetCode, issuerKeys.publicKey());

  console.log(`\n--- Issuing ${assetCode} ---`);

  try {
    // 1. Load accounts
    const distributorAccount = await server.loadAccount(distributorKeys.publicKey());
    const issuerAccount = await server.loadAccount(issuerKeys.publicKey());

    // 2. Establish trustline (Distributor -> Issuer)
    console.log(`Establishing trustline for ${assetCode}...`);
    const trustTx = new TransactionBuilder(distributorAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: skinAsset,
        })
      )
      .setTimeout(30)
      .build();

    trustTx.sign(distributorKeys);
    await server.submitTransaction(trustTx);
    console.log(`Trustline established.`);

    // 3. Mint assets (Issuer -> Distributor)
    console.log(`Minting ${amount} units of ${assetCode}...`);
    const paymentTx = new TransactionBuilder(issuerAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: distributorKeys.publicKey(),
          asset: skinAsset,
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    paymentTx.sign(issuerKeys);
    await server.submitTransaction(paymentTx);
    console.log(`Minting successful.`);

  } catch (error) {
    console.error(`Failed to issue ${assetCode}:`, error.response ? error.response.data : error.message);
  }
}

async function main() {
  // Issuing a few different skins
  await issueAsset('SKIN01', '1000'); // Common Skin
  await issueAsset('SKIN02', '100');  // Rare Skin
  await issueAsset('SKIN03', '10');   // Legendary Skin
}

main();
