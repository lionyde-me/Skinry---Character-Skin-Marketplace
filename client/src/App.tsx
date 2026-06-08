import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { connectWallet, getSkinOffers, buySkin, getAccountDetails, getTradeHistory } from './stellar';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { X, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Offer {
  amount: string;
  price: string;
  change?: number;
}

interface SkinData {
  code: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  description: string;
}

interface Trade {
  id: string;
  timestamp: string;
  amount: string;
  price: number;
  buyer: string;
  seller: string;
}

const SKINS: SkinData[] = [
  { code: 'SKIN01', name: 'Desert Marauder', rarity: 'common', description: 'A rugged skin for survival in harsh desert environments.' },
  { code: 'SKIN02', name: 'Neon Spectre', rarity: 'rare', description: 'Glow in the dark with this high-tech cyberpunk aesthetic.' },
  { code: 'SKIN03', name: 'Celestial Dragon', rarity: 'legendary', description: 'Harness the power of ancient stars with this mythic skin.' },
  { code: 'SKIN04', name: 'Shadow Stalker', rarity: 'rare', description: 'Become one with the shadows with this lightweight tactical gear.' },
  { code: 'SKIN05', name: 'Inferno Plate', rarity: 'legendary', description: 'Forged in the heart of a volcano, this armor radiates intense heat.' },
  { code: 'SKIN06', name: 'Frostbite Garb', rarity: 'common', description: 'Simple but effective insulated clothing for the coldest peaks.' },
  { code: 'SKIN07', name: 'Steam Engine', rarity: 'rare', description: 'A masterpiece of steampunk engineering with functional brass gears.' },
  { code: 'SKIN08', name: 'Emerald Archer', rarity: 'common', description: 'Traditional forest attire used by elite woodland scouts.' },
  { code: 'SKIN09', name: 'Void Walker', rarity: 'legendary', description: 'Armor that seems to consume the light around it, originating from beyond.' },
  { code: 'SKIN10', name: 'Iron Vanguard', rarity: 'common', description: 'Heavy-duty iron plating for the front-line soldiers.' },
  { code: 'SKIN11', name: 'Thunder God', rarity: 'legendary', description: 'Charged with static electricity, leaving a trail of sparks.' },
  { code: 'SKIN12', name: 'Crimson Assassin', rarity: 'rare', description: 'A striking red hood designed for the most elegant of killers.' },
  { code: 'SKIN13', name: 'Golem Husk', rarity: 'common', description: 'Rough stone textures that provide natural camouflage in rocky terrain.' },
  { code: 'SKIN14', name: 'Solar Flare', rarity: 'rare', description: 'Robes woven from captured sunlight, providing a warm golden glow.' },
  { code: 'SKIN15', name: 'Necro Acolyte', rarity: 'legendary', description: 'Adorned with the remains of the fallen, channeling dark energies.' },
  { code: 'SKIN16', name: 'Sea King', rarity: 'rare', description: 'Scale-covered armor that allows for swift movement underwater.' },
  { code: 'SKIN17', name: 'Urban Runner', rarity: 'common', description: 'Modern, comfortable streetwear optimized for parkour.' },
  { code: 'SKIN18', name: 'Bio Hazard', rarity: 'rare', description: 'A reinforced suit designed to withstand the most toxic environments.' },
  { code: 'SKIN19', name: 'Phoenix Feather', rarity: 'legendary', description: 'Woven with feathers that never stop burning with an eternal flame.' },
  { code: 'SKIN20', name: 'Clockwork Pilot', rarity: 'rare', description: 'Equipped with goggles and flight gear for the daring aviator.' },
  { code: 'SKIN21', name: 'Stone Guardian', rarity: 'common', description: 'Ancient moss-covered stone plates that offer surprising durability.' },
  { code: 'SKIN22', name: 'Night Raven', rarity: 'rare', description: 'A feathered cloak that provides near-silent movement at night.' },
  { code: 'SKIN23', name: 'Archangel', rarity: 'legendary', description: 'Divine golden armor that marks the wearer as a champion of light.' },
  { code: 'SKIN24', name: 'Toxic Waste', rarity: 'common', description: 'Hazmat-themed gear for the most polluted zones.' },
  { code: 'SKIN25', name: 'Glitch King', rarity: 'rare', description: 'A suit that flickers and distorts, confusing enemies in combat.' },
  { code: 'SKIN26', name: 'Cyber Samurai', rarity: 'legendary', description: 'The ultimate fusion of ancient tradition and futuristic tech.' },
  { code: 'SKIN27', name: 'Sand Nomad', rarity: 'common', description: 'Lightweight robes designed for long treks across the dunes.' },
  { code: 'SKIN28', name: 'Plasma Guard', rarity: 'rare', description: 'Shielded with energy fields that ripple with purple light.' },
  { code: 'SKIN29', name: 'Blood Moon', rarity: 'legendary', description: 'Cursed armor that glows with a sinister crimson light during lunar events.' },
  { code: 'SKIN30', name: 'Scrap Metal', rarity: 'common', description: 'Rudimentary protection cobbled together from wasteland debris.' },
  { code: 'SKIN31', name: 'Deep Sea Diver', rarity: 'rare', description: 'Heavy-duty pressurized suit for exploring the abyss.' },
  { code: 'SKIN32', name: 'Sun Wukong', rarity: 'legendary', description: 'Inspired by the Monkey King, granting incredible agility.' },
  { code: 'SKIN33', name: 'Forest Ranger', rarity: 'common', description: 'Standard issue gear for protecting the great woodlands.' },
  { code: 'SKIN34', name: 'Electric Soul', rarity: 'rare', description: 'A transparent suit filled with humming electrical currents.' },
  { code: 'SKIN35', name: 'Viking Raider', rarity: 'legendary', description: 'Heavy furs and enchanted steel for the true northern warrior.' },
  { code: 'SKIN36', name: 'Neon Biker', rarity: 'common', description: 'Flashy street gear for the high-speed urban chases.' },
  { code: 'SKIN37', name: 'Plague Doctor', rarity: 'rare', description: 'An eerie costume that strikes fear into the hearts of survivors.' },
  { code: 'SKIN38', name: 'Gravity Master', rarity: 'legendary', description: 'Modified with anti-gravity tech to allow for short bursts of flight.' },
  { code: 'SKIN39', name: 'Copper Knight', rarity: 'common', description: 'Polished copper armor that provides basic but reliable protection.' },
  { code: 'SKIN40', name: 'Frost Archer', rarity: 'rare', description: 'Lightweight gear that leaves a trail of snowflakes in its wake.' },
  { code: 'SKIN41', name: 'Galaxy Wanderer', rarity: 'legendary', description: 'Cloaked in the infinite beauty of the cosmos.' },
  { code: 'SKIN42', name: 'Steam Tech', rarity: 'common', description: 'Basic mechanical enhancements for the aspiring engineer.' },
  { code: 'SKIN43', name: 'Golden Pharaoh', rarity: 'legendary', description: 'Royal attire from a forgotten era, inlaid with pure gold.' },
];

function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState('0');
  const [ownedSkins, setOwnedSkins] = useState<{code: string, balance: string}[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer[]>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'legendary' | 'watchlist'>('all');
  const [watchlist, setWatchlist] = useState<string[]>(JSON.parse(localStorage.getItem('watchlist') || '[]'));
  const [isCrafting, setIsCrafting] = useState(false);

  const [selectedSkin, setSelectedSkin] = useState<SkinData | null>(null);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);

  // History filtering & pagination state
  const [timeRange, setTimeRange] = useState<'all' | 'day' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchOffers();
    if (publicKey) {
      fetchAccountDetails();
    }
  }, [publicKey]);

  const fetchOffers = async () => {
    const newOffers: Record<string, Offer[]> = {};
    for (const skin of SKINS) {
      let asks = await getSkinOffers(skin.code);
      
      // If no real SDEX offers found, generate a mock one for visual completeness
      if (asks.length === 0) {
        const basePriceMap: Record<string, number> = {
          'common': 5,
          'rare': 50,
          'legendary': 500
        };
        const price = basePriceMap[skin.rarity] + (Math.random() * (basePriceMap[skin.rarity] * 0.2));
        asks = [{ 
            amount: (Math.floor(Math.random() * 20) + 1).toString(), 
            price: price.toFixed(2),
            price_r: { n: Math.floor(price * 10000000), d: 10000000 }
        } as any];
      }
      
      newOffers[skin.code] = asks.map((a: any) => ({ 
        amount: a.amount, 
        price: a.price,
        change: a.change || (Math.random() * 10) - 4 // Mock change from -4% to +6%
      }));
    }
    setOffers(newOffers);
  };

  const fetchAccountDetails = async () => {
    if (!publicKey) return;
    const details = await getAccountDetails(publicKey);
    setXlmBalance(details.xlmBalance);
    setOwnedSkins(details.assets);
  };

  const handleConnect = async () => {
    const key = await connectWallet();
    if (key) setPublicKey(key);
  };

  const handleBuy = async (code: string, price: string, quantity: number) => {
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }
    setLoading(true);
    setStatus(`Processing transaction for ${quantity} x ${code}...`);
    try {
      await buySkin(publicKey, code, quantity.toString(), price);
      setStatus(`Successfully acquired ${quantity} x ${code}!`);
      setTimeout(() => setStatus(''), 5000);
      fetchOffers();
      fetchAccountDetails();
    } catch (e) {
      setStatus(`Transaction failed.`);
      setTimeout(() => setStatus(''), 5000);
      console.error(e);
    }
    setLoading(false);
  };

  const toggleWatchlist = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    const newWatchlist = watchlist.includes(code) 
      ? watchlist.filter(c => c !== code) 
      : [...watchlist, code];
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  const handleCraft = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }
    setIsCrafting(true);
    setStatus('Analyzing materials for crafting...');
    // Simulate burning 3 commons for a rare
    setTimeout(() => {
      setStatus('Successfully crafted a rare item! (Demo Simulation)');
      setTimeout(() => setStatus(''), 5000);
      setIsCrafting(false);
      fetchAccountDetails();
    }, 3000);
  };

  const openModal = async (skin: SkinData) => {
    setSelectedSkin(skin);
    setBuyQuantity(1);
    setIsModalLoading(true);
    const history = await getTradeHistory(skin.code);
    setTradeHistory(history);
    setTimeRange('day');
    setCurrentPage(1);
    setIsModalLoading(false);
  };

  const filteredSkins = useMemo(() => {
    return SKINS.filter(skin => {
      const matchesSearch = skin.name.toLowerCase().includes(search.toLowerCase()) || 
                           skin.code.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'watchlist' ? watchlist.includes(skin.code) : skin.rarity === filter);
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, watchlist]);


  const filteredHistory = useMemo(() => {
    if (timeRange === 'all') return tradeHistory;
    
    const now = new Date();
    let cutoff = new Date(0);

    if (timeRange === 'day') cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (timeRange === 'week') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeRange === 'month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      cutoff = d;
    }
    if (timeRange === 'year') {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      cutoff = d;
    }

    if (timeRange === 'custom') {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return tradeHistory.filter(t => {
        const date = new Date(t.timestamp);
        return date >= start && date <= end;
      });
    }

    return tradeHistory.filter(t => new Date(t.timestamp) >= cutoff);
  }, [tradeHistory, timeRange, startDate, endDate]);

  const chartData = useMemo(() => {
    return filteredHistory.map((t, index) => ({
      name: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      uniqueKey: `${t.timestamp}-${index}`,
      price: t.price,
      amount: parseFloat(t.amount)
    })).reverse();
  }, [filteredHistory]);

  const totalQuantity = useMemo(() => {
    return filteredHistory.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [filteredHistory]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  const priceTrend = useMemo(() => {
    if (tradeHistory.length < 2) return null;
    const current = tradeHistory[0].price;
    const previous = tradeHistory[tradeHistory.length - 1].price;
    const percent = ((current - previous) / previous) * 100;
    return { percent, increased: percent >= 0 };
  }, [tradeHistory]);

  return (
    <div className="container">
      <header>
        <h1>Skinry</h1>
        <div className="wallet-box">
          {publicKey ? (
            <>
              <div className="balance-pill">{parseFloat(xlmBalance).toFixed(2)} XLM</div>
              <div className="wallet-address">
                {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
              </div>
            </>
          ) : (
            <button onClick={handleConnect} className="btn-primary">Connect Wallet</button>
          )}
        </div>
      </header>

      <div className="controls">
        <input 
          type="text" 
          placeholder="Search skins..." 
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(['all', 'common', 'rare', 'legendary', 'watchlist'] as const).map(f => (
          <button 
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <main>
        {filteredSkins.length > 0 ? (
          <div className="skin-grid">
            {filteredSkins.map(skin => {
              const skinOffers = offers[skin.code] || [];
              const isOwned = ownedSkins.some(s => s.code === skin.code && parseFloat(s.balance) > 0);
              const isWatched = watchlist.includes(skin.code);
              
              return (
                <div key={skin.code} className="skin-card" onClick={() => openModal(skin)}>
                  <div className="skin-image-container">
                    <img src={`https://placehold.co/400x400?text=${skin.code}`} alt={skin.name} />
                    <span className={`rarity-badge rarity-${skin.rarity}`}>{skin.rarity}</span>
                    <button 
                      className={`watchlist-btn ${isWatched ? 'active' : ''}`}
                      onClick={(e) => toggleWatchlist(e, skin.code)}
                    >
                      ★
                    </button>
                  </div>
                  <div className="skin-info">
                    <h3>{skin.name}</h3>
                    <p className="skin-desc" style={{ marginBottom: '1rem' }}>{skin.description}</p>
                    
                    <div className="price-row" style={{ border: 'none', paddingTop: 0 }}>
                      {skinOffers.length > 0 ? (
                        <div className="card-price-state">
                          <span className="price-amount">{skinOffers[0].price} XLM</span>
                          <span className={`trend-pill ${skinOffers[0].change! >= 0 ? 'trend-up' : 'trend-down'}`}>
                            {skinOffers[0].change! >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(skinOffers[0].change!).toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="price-muted">No active listings</span>
                      )}
                      {isOwned && <span className="balance-pill">Owned</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No skins found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSkin && (
        <div className="modal-overlay" onClick={() => setSelectedSkin(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedSkin.name} Details</h2>
              <button className="close-btn" onClick={() => setSelectedSkin(null)}><X size={24} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-image">
                  <img src={`https://placehold.co/400x400?text=${selectedSkin.code}`} alt={selectedSkin.name} />
                  <div className="analytics-cards">
                    <div className="stat-card">
                      <span className="stat-label">Bidding Trend</span>
                      <div className={`stat-value ${priceTrend?.increased ? 'trend-up' : 'trend-down'}`}>
                        {priceTrend ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {priceTrend.increased ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            {Math.abs(priceTrend.percent).toFixed(1)}%
                          </span>
                        ) : 'No Data'}
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Total Bids</span>
                      <div className="stat-value">{tradeHistory.length}</div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`rarity-badge rarity-${selectedSkin.rarity}`} style={{ position: 'static' }}>{selectedSkin.rarity}</span>
                    {selectedSkin.rarity === 'common' && (
                      <button 
                        className="btn-primary" 
                        style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                        onClick={handleCraft}
                        disabled={isCrafting}
                      >
                        {isCrafting ? 'Crafting...' : 'Craft Rare'}
                      </button>
                    )}
                  </div>
                  <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{selectedSkin.description}</p>
                  
                  <div className="chart-section" style={{ marginTop: '2rem' }}>
                    <div className="chart-header">
                      <span className="chart-title">Auction Activity</span>
                      <Activity size={18} color="var(--primary)" />
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e36" vertical={false} />
                          <XAxis 
                            dataKey="uniqueKey" 
                            hide 
                          />
                          <YAxis domain={['auto', 'auto']} hide />
                          <Tooltip 
                            contentStyle={{ 
                              background: '#1c1c21', 
                              border: '1px solid #2e2e36', 
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                              pointerEvents: 'none'
                            }}
                            labelStyle={{ display: 'none' }}
                            itemStyle={{ color: '#7d64ff' }}
                            cursor={{ stroke: '#2e2e36', strokeWidth: 1 }}
                            isAnimationActive={false}
                            formatter={(value: any, _name: any, props: any) => {
                              return [
                                `${parseFloat(value).toFixed(2)} XLM`, 
                                props.payload.name
                              ];
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#7d64ff" 
                            strokeWidth={3} 
                            dot={false}
                            activeDot={{ r: 6, fill: '#7d64ff', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {offers[selectedSkin.code] && offers[selectedSkin.code].length > 0 && (
                <div className="purchase-card-wide">
                  <div className="purchase-header">
                    <h3>Instant Purchase</h3>
                    <p>Secure this skin immediately from the market</p>
                  </div>
                  <div className="purchase-controls-row">
                    <div className="qty-control">
                      <button 
                        className="qty-btn" 
                        onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                      >
                        -
                      </button>
                      <span className="qty-display">{buyQuantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => setBuyQuantity(buyQuantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="total-price-box">
                      <span className="total-label">Total Amount</span>
                      <div className="total-amount">
                        {(parseFloat(offers[selectedSkin.code][0].price) * buyQuantity).toFixed(2)} XLM
                      </div>
                    </div>

                    <button 
                      className="btn-primary buy-btn-large"
                      onClick={() => handleBuy(selectedSkin.code, offers[selectedSkin.code][0].price, buyQuantity)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Complete Purchase'}
                    </button>
                  </div>
                </div>
              )}

              <div className="history-section">
                <div className="history-controls">
                  <h3>Bidding History</h3>
                  <div className="history-filters">
                    {(['all', 'day', 'week', 'month', 'year'] as const).map(r => (
                      <button 
                        key={r}
                        className={`range-btn ${timeRange === r ? 'active' : ''}`}
                        onClick={() => { setTimeRange(r); setCurrentPage(1); }}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                    <div className="custom-range">
                      <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setTimeRange('custom'); setCurrentPage(1); }} />
                      <span>-</span>
                      <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setTimeRange('custom'); setCurrentPage(1); }} />
                    </div>
                  </div>
                  <div className="balance-pill">Total Qty: {totalQuantity}</div>
                </div>

                {isModalLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                ) : filteredHistory.length > 0 ? (
                  <>
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Buyer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistory.map(trade => (
                          <tr key={trade.id}>
                            <td>{new Date(trade.timestamp).toLocaleString()}</td>
                            <td style={{ fontWeight: 'bold' }}>{trade.price.toFixed(2)} XLM</td>
                            <td>{parseFloat(trade.amount).toFixed(0)}</td>
                            <td className="address-cell">
                              {trade.buyer ? `${trade.buyer.slice(0, 6)}...${trade.buyer.slice(-4)}` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button 
                          className="page-btn" 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                        >
                          Prev
                        </button>
                        <span className="page-info">Page {currentPage} of {totalPages}</span>
                        <button 
                          className="page-btn" 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="empty-state" style={{ padding: '2rem' }}>No trade history found for this criteria.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className="status-toast">
          {loading && <div className="spinner"></div>}
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}

export default App;
