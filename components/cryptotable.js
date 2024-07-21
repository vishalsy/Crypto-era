import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from '../components/CryptoTable.module.css';
import CryptoChart from '../components/trendingchart';

const ItemTypes = {
  CRYPTO: 'crypto',
};

const DraggableCrypto = ({ item, onDrag }) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.CRYPTO,
    item: { item },
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        onDrag(item.item);
      }
    },
  }));

  return (
    <tr ref={drag} onClick={() => onDrag(item)}>
      <td>{item.name}</td>
      <td>${item.current_price}</td>
      <td>{item.price_change_percentage_24h.toFixed(2)}%</td>
      <td>${item.market_cap}</td>
    </tr>
  );
};

const DroppableWatchlist = ({ children, onDrop }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CRYPTO,
    drop: (droppedItem) => {
      onDrop(droppedItem.item);
    },
  }));

  return (
    <div ref={drop} className={styles.watchlist}>
      <h2>Watchlist</h2>
      {children}
    </div>
  );
};

const fetchCryptoData = async () => {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d,30d,1y'
  );
  const data = await res.json();
  return data;
};

const fetchCryptoDetails = async (id) => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const data = await res.json();
  return data;
};

export default function Home() {
  const [cryptoData, setCryptoData] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinDetails, setCoinDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      const data = await fetchCryptoData();
      setCryptoData(data);
    })();
  }, []);

  const handleItemClick = async (item) => {
    const details = await fetchCryptoDetails(item.id);
    setCoinDetails(details);
    setSelectedCoin(item);
    setRecentlyViewed((prev) => {
      const newList = [item, ...prev.filter((i) => i.id !== item.id)];
      return newList.slice(0, 5);
    });
  };

  const handleDropToWatchlist = (item) => {
    setWatchlist((prev) => {
      if (!prev.some((i) => i.id === item.id)) {
        return [item, ...prev];
      }
      return prev;
    });
  };

  const handleBackClick = () => {
    setSelectedCoin(null);
    setCoinDetails(null);
  };

  const filteredCryptoData = cryptoData.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Crypto-Era</h2>
          <input
            type="text"
            placeholder="Search coins..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.mainContent}>
          <div className={styles.leftPanel}>
            {selectedCoin ? (
              <div className={styles.coinDetails}>
                <button onClick={handleBackClick}>Back</button>
                <h2>{coinDetails.name}</h2>
                <CryptoChart coin={selectedCoin.id} />
                <p>Market Cap: ${coinDetails.market_data.market_cap.usd}</p>
                <p>24h Trading Volume: ${coinDetails.market_data.total_volume.usd}</p>
                <p>Total Supply: {coinDetails.market_data.total_supply}</p>
                <p>Max Supply: {coinDetails.market_data.max_supply}</p>
              </div>
            ) : (
              <>
                <div className={styles.chart}>
                  <CryptoChart />
                </div>
                <div className={styles.trendingMarket}>
                  <h2>Trending Market</h2>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Last Price</th>
                        <th>24H Change</th>
                        <th>Market Cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCryptoData.map((item) => (
                        <DraggableCrypto key={item.id} item={item} onDrag={handleItemClick} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className={styles.rightPanel}>
            <DroppableWatchlist onDrop={handleDropToWatchlist}>
              <ul>
                {watchlist.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </DroppableWatchlist>
            <div className={styles.recentlyViewed}>
              <h2>Recently Viewed</h2>
              <ul>
                {recentlyViewed.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
