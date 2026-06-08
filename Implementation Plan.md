# Implementation Plan: Skinry - Character Skin Marketplace

This document outlines the phased implementation strategy for Skinry, a decentralized marketplace for in-game skins using Stellar Classic Assets.

## Phase 1: Environment & Account Setup
- [x] Initialize Node.js project in `scripts/`.
- [x] Set up `.env` for Testnet secret keys (Issuer and Distributor accounts).
- [x] Create a script to generate and fund Testnet accounts via Friendbot.
- [x] Configure Stellar SDK for Testnet.

## Phase 2: Asset Issuance (The "Skin" Factory)
- [x] **Asset Definition:** Design the naming convention for skin assets (e.g., `SKIN01`, `SKIN02`, `SKIN03`).
- [x] **Issuance Script:** 
    - Create a script to establish trustlines between the Distributor and Issuer.
    - Perform initial payment (minting) of assets from Issuer to Distributor.
    - Set options for the Issuer.
- [x] **Metadata:** Create a `stellar.toml` (SEP-1) template in `metadata/` to define asset branding and descriptions.

## Phase 3: Marketplace Logic (SDEX Integration)
- [x] **Selling Skins:**
    - Develop a script to place `ManageSellOffer` transactions on the SDEX.
    - Implement price discovery logic (listing skins for XLM).
- [x] **Buying Skins:**
    - Implement `ManageBuyOffer` for players to acquire skins.
- [x] **Order Book Monitoring:**
    - Create scripts to fetch and display the current order book for specific skin assets.

## Phase 4: Frontend Development (`client/`)
- [x] **Wallet Integration:** 
    - Integrate **Freighter Wallet** for secure transaction signing.
    - Implement account balance and trustline detection.
- [x] **Marketplace UI:**
    - Build a gallery view for available skins.
    - Create "Buy" buttons that trigger Freighter transactions.
- [x] **Transaction Feedback:** Implement real-time updates for transaction status.

## Phase 5: Testing & Validation
- [x] **Unit Tests:** Verified script logic for asset creation and offer management via local execution.
- [x] **Integration Tests:** End-to-end flow from minting a skin to a player purchasing it on the marketplace verified.
- [x] **User Acceptance:** Freighter signatures correctly authorize SDEX operations.

## Technical Stack
- **Network:** Stellar Testnet
- **SDK:** `@stellar/stellar-sdk` & `@stellar/freighter-api`
- **Frontend:** React + TypeScript (Vite)
- **Wallet:** Freighter
- **Storage:** Metadata via `stellar.toml`.

## Future Roadmap & Improvements
- [ ] **Royalty Enforcement (Soroban):** Implement smart contracts to automatically distribute a percentage of secondary sales back to the original game developers.
- [P] **Skin Crafting/Burning:** Create a mechanism where users can "burn" multiple common skins to receive a rare or legendary one.
- [ ] **Cross-Game Interoperability:** Develop a standardized metadata format so the same "Classic Asset" skin can be recognized and rendered across multiple games.
- [P] **Auction House:** Add support for time-limited auctions with bidding functionality.
- [ ] **Bundle Trading:** Allow users to trade multiple skins or assets in a single atomic transaction.
- [P] **Social Features:** Implement a "Watchlist" for skins and price alert notifications.
- [ ] **Mobile App:** Develop a native mobile experience for trading on the go.
- [ ] **Fiat On-Ramp:** Integrate with Stellar anchors to allow users to buy skins directly with fiat currency.

