const { Keypair } = require('@stellar/stellar-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function createAndFundAccount(label) {
  const pair = Keypair.random();
  console.log(`Generating ${label} account...`);
  console.log(`Public Key: ${pair.publicKey()}`);
  
  try {
    console.log(`Funding ${label} via Friendbot...`);
    const response = await axios.get(`https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`);
    console.log(`Success! ${label} funded.`);
    return pair;
  } catch (e) {
    console.error(`Error funding ${label}:`, e.response ? e.response.data : e.message);
    throw e;
  }
}

async function main() {
  try {
    const issuer = await createAndFundAccount('Issuer');
    const distributor = await createAndFundAccount('Distributor');

    const envContent = `
STELLAR_NETWORK=TESTNET
ISSUER_PUBLIC_KEY=${issuer.publicKey()}
ISSUER_SECRET_KEY=${issuer.secret()}
DISTRIBUTOR_PUBLIC_KEY=${distributor.publicKey()}
DISTRIBUTOR_SECRET_KEY=${distributor.secret()}
`.trim();

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    console.log(`\nKeys saved to ${envPath}`);
    console.log('IMPORTANT: Keep your secret keys safe and never commit the .env file!');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

main();
