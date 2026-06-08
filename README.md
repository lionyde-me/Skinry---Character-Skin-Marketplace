# Skinry

A decentralized marketplace for trading in-game skins as Stellar classic assets.

## Problem
In-game skins are currently trapped in "walled gardens," meaning players do not truly own the items they purchase and cannot easily trade them outside of specific platforms. This lack of interoperability and liquidity limits the value of digital assets for players. Skinry solves this by issuing skins as Stellar classic assets, allowing them to be freely traded on the Stellar Decentralized Exchange (SDEX).

## How It Works
1. **Issuance:** Game developers (Issuer) mint skin assets and transfer them to a Distributor account.
2. **Listing:** The Distributor lists these skins on the Stellar Decentralized Exchange (SDEX) by creating sell offers for XLM.
3. **Browsing:** Users browse the marketplace via the Skinry React frontend, which displays available skins from the SDEX order book.
4. **Purchase:** Users connect their Freighter wallet and execute a trade on the SDEX to acquire skins instantly and securely.

## How It Uses Stellar
Skinry leverages the following Stellar primitives:
- **Classic Assets:** Each skin is represented as a Stellar asset, ensuring compatibility with the entire Stellar ecosystem.
- **SDEX (Stellar Decentralized Exchange):** Provides a built-in marketplace where skins can be traded against XLM or other assets without a centralized intermediary.
- **Stellar SDK:** Used for creating asset issuance transactions, setting up trustlines, and managing marketplace offers.
- **SEP-1 (Stellar Info File):** Provides metadata and branding for the skin assets, making them recognizable across the ecosystem.

## Track
Track 3: DeFi, Stablecoins & Real-World Assets

## Tech Stack
- Framework: React + TypeScript (Vite)
- Stellar SDK: `@stellar/stellar-sdk` ^15.1.0 & `@stellar/freighter-api` ^6.0.1
- Network: Testnet
- UI: Vanilla CSS, Lucide React

## Setup & Run

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/LioNyde/Skinry---Character-Skin-Marketplace
cd Skinry---Character-Skin-Marketplace
\`\`\`

### 2. Account Setup & Asset Issuance
Navigate to the \`scripts\` directory:
\`\`\`bash
cd scripts
npm install
node setup-accounts.js  # Generates and funds Issuer/Distributor
node issue-assets.js   # Mints skins (SKIN01, SKIN02, SKIN03)
node marketplace-offers.js # Lists skins on SDEX
\`\`\`

### 3. Run Marketplace Frontend
Navigate to the \`client\` directory:
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`
Ensure you have the **Freighter Wallet** extension installed and set to **Testnet**.

## Network Details
- Network: Testnet
- Horizon URL: https://horizon-testnet.stellar.org
- Asset Issuer: GA645QP3GUXULRIK3R3Z2VTVECFWYTHT7YGM2XEEUYRWK7GRXXD6L42A

## Team
- LioNyde — @LioNyde

## License
MIT
