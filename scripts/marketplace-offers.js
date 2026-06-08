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

const SKINS = [
  { code: 'SKIN01', rarity: 'common' }, { code: 'SKIN02', rarity: 'rare' }, { code: 'SKIN03', rarity: 'legendary' },
  { code: 'SKIN04', rarity: 'rare' }, { code: 'SKIN05', rarity: 'legendary' }, { code: 'SKIN06', rarity: 'common' },
  { code: 'SKIN07', rarity: 'rare' }, { code: 'SKIN08', rarity: 'common' }, { code: 'SKIN09', rarity: 'legendary' },
  { code: 'SKIN10', rarity: 'common' }, { code: 'SKIN11', rarity: 'legendary' }, { code: 'SKIN12', rarity: 'rare' },
  { code: 'SKIN13', rarity: 'common' }, { code: 'SKIN14', rarity: 'rare' }, { code: 'SKIN15', rarity: 'legendary' },
  { code: 'SKIN16', rarity: 'rare' }, { code: 'SKIN17', rarity: 'common' }, { code: 'SKIN18', rarity: 'rare' },
  { code: 'SKIN19', rarity: 'legendary' }, { code: 'SKIN20', rarity: 'rare' }, { code: 'SKIN21', rarity: 'common' },
  { code: 'SKIN22', rarity: 'rare' }, { code: 'SKIN23', rarity: 'legendary' }, { code: 'SKIN24', rarity: 'common' },
  { code: 'SKIN25', rarity: 'rare' }, { code: 'SKIN26', rarity: 'legendary' }, { code: 'SKIN27', rarity: 'common' },
  { code: 'SKIN28', rarity: 'rare' }, { code: 'SKIN29', rarity: 'legendary' }, { code: 'SKIN30', rarity: 'common' },
  { code: 'SKIN31', rarity: 'rare' }, { code: 'SKIN32', rarity: 'legendary' }, { code: 'SKIN33', rarity: 'common' },
  { code: 'SKIN34', rarity: 'rare' }, { code: 'SKIN35', rarity: 'legendary' }, { code: 'SKIN36', rarity: 'common' },
  { code: 'SKIN37', rarity: 'rare' }, { code: 'SKIN38', rarity: 'legendary' }, { code: 'SKIN39', rarity: 'common' },
  { code: 'SKIN40', rarity: 'rare' }, { code: 'SKIN41', rarity: 'legendary' }, { code: 'SKIN42', rarity: 'common' },
  { code: 'SKIN43', rarity: 'legendary' }
];

async function listSkinForSale(assetCode, amount, price) {
  const distributorKeys = Keypair.fromSecret(process.env.DISTRIBUTOR_SECRET_KEY);
  const issuerPublicKey = process.env.ISSUER_PUBLIC_KEY;

  const skinAsset = new Asset(assetCode, issuerPublicKey);
  const xlmAsset = Asset.native();

  console.log(`\n--- Listing ${amount} ${assetCode} for ${price} XLM each ---`);

  try {
    const distributorAccount = await server.loadAccount(distributorKeys.publicKey());

    const offerTx = new TransactionBuilder(distributorAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageSellOffer({
          selling: skinAsset,
          buying: xlmAsset,
          amount: amount,
          price: price,
        })
      )
      .setTimeout(30)
      .build();

    offerTx.sign(distributorKeys);
    const result = await server.submitTransaction(offerTx);
    console.log(`Offer placed successfully. Offer ID: ${result.hash}`);
    return true;
  } catch (error) {
    console.error(`Failed to place offer for ${assetCode}:`, error.response ? error.response.data : error.message);
    return false;
  }
}

async function main() {
  const basePriceMap = { 'common': '5', 'rare': '50', 'legendary': '500' };
  
  console.log(`Starting mass listing for ${SKINS.length} skins...`);
  
  for (const skin of SKINS) {
    const success = await listSkinForSale(skin.code, '10', basePriceMap[skin.rarity]);
    if (!success) {
      console.log('Stopping due to error.');
      break;
    }
    // Small delay to be nice to Horizon
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Mass listing complete.');
}

main();
