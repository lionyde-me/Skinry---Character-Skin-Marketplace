import {
  Horizon,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
} from '@stellar/stellar-sdk';
import {
  isConnected,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const ISSUER_PUBLIC_KEY = 'GA645QP3GUXULRIK3R3Z2VTVECFWYTHT7YGM2XEEUYRWK7GRXXD6L42A';

export const connectWallet = async () => {
  if (await isConnected()) {
    const { address } = await getAddress();
    return address;
  }
  return null;
};

export const getSkinOffers = async (assetCode: string) => {
  try {
    const skinAsset = new Asset(assetCode, ISSUER_PUBLIC_KEY);
    const xlmAsset = Asset.native();
    const orderBook = await server.orderbook(skinAsset, xlmAsset).call();
    return orderBook.asks; // Offers to sell skins for XLM
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
};

export const buySkin = async (userPublicKey: string, assetCode: string, amount: string, price: string) => {
  try {
    const skinAsset = new Asset(assetCode, ISSUER_PUBLIC_KEY);
    const xlmAsset = Asset.native();
    
    const account = await server.loadAccount(userPublicKey);
    const baseFee = await server.fetchBaseFee();

    const transaction = new TransactionBuilder(account, {
      fee: baseFee.toString(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: skinAsset,
        })
      )
      .addOperation(
        Operation.manageBuyOffer({
          selling: xlmAsset,
          buying: skinAsset,
          buyAmount: amount,
          price: price,
        })
      )
      .setTimeout(30)
      .build();

    const xdr = transaction.toXDR();
    const resultSign = await signTransaction(xdr, { networkPassphrase: Networks.TESTNET });
    
    const result = await server.submitTransaction(TransactionBuilder.fromXDR(resultSign.signedTxXdr, Networks.TESTNET));
    return result;
  } catch (error) {
    console.error('Error buying skin:', error);
    throw error;
  }
};

export const getAccountDetails = async (publicKey: string) => {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find((b) => b.asset_type === 'native')?.balance || '0';
    const assets = account.balances
      .filter((b) => b.asset_type !== 'native')
      .map((b: any) => ({
        code: b.asset_code,
        balance: b.balance,
      }));
    return { xlmBalance, assets };
  } catch (error) {
    console.error('Error fetching account details:', error);
    return { xlmBalance: '0', assets: [] };
  }
};

const generateMockTrades = (assetCode: string) => {
  const basePriceMap: Record<string, number> = {
    'SKIN01': 5,
    'SKIN02': 50,
    'SKIN03': 500
  };
  const basePrice = basePriceMap[assetCode] || 10;
  const mockTrades = [];
  const now = Date.now();
  
  // Generate 100 mock trades over the last year
  for (let i = 0; i < 100; i++) {
    // Randomly spread trades: some recent, some old
    // i=0 is newest, i=99 is oldest
    // We'll use a non-linear scale to have more recent trades
    const timeOffset = Math.pow(i / 100, 2) * (365 * 24 * 3600000); 
    
    const trend = (100 - i) * (basePrice * 0.005); 
    const noise = (Math.random() - 0.5) * (basePrice * 0.1);
    
    mockTrades.push({
      id: `mock-${assetCode}-${i}`,
      timestamp: new Date(now - timeOffset).toISOString(),
      amount: (Math.floor(Math.random() * 5) + 1).toString(),
      price: basePrice + trend + noise,
      buyer: "GD...DEMO",
      seller: "GA...DEMO"
    });
  }
  return mockTrades; // Already newest to oldest due to i=0 being smallest offset
};

export const getTradeHistory = async (assetCode: string) => {
  try {
    const skinAsset = new Asset(assetCode, ISSUER_PUBLIC_KEY);
    const xlmAsset = Asset.native();
    
    const trades = await server.trades()
      .forAssetPair(skinAsset, xlmAsset)
      .limit(50)
      .order('desc')
      .call();
      
    const realTrades = trades.records.map((r: any) => ({
      id: r.id,
      timestamp: r.ledger_close_time,
      amount: r.base_amount,
      price: parseFloat(r.price.n) / parseFloat(r.price.d),
      buyer: r.base_account || r.buyer,
      seller: r.counter_account || r.seller
    }));

    // Combine real trades with mock data for visual flavor
    const mockTrades = generateMockTrades(assetCode);
    return [...realTrades, ...mockTrades];
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return generateMockTrades(assetCode); // Fallback to all mock if network fails
  }
};

export { ISSUER_PUBLIC_KEY };
