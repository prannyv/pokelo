// CardListView.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card';
import { fetchAllCards } from '../services/api';

const CardListView = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: 'elo',
    direction: 'desc'
  });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      try {
        const allCards = await fetchAllCards();
        setCards(allCards);
      } catch (error) {
        console.error("Failed to load cards:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  const handleSort = (key) => {
    const direction = 
      sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction });
  };

  const sortedCards = React.useMemo(() => {
    if (!cards.length) return [];
    
    const sortableCards = [...cards];
    
    // First, separate cards with matches from those without
    const cardsWithMatches = sortableCards.filter(card => card.matches > 0);
    const cardsWithoutMatches = sortableCards.filter(card => card.matches === 0);
    
    // Sort each group independently
    const sortFn = (a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    };
    
    const sortedWithMatches = cardsWithMatches.sort(sortFn);
    const sortedWithoutMatches = cardsWithoutMatches.sort(sortFn);
    
    // Return the combined array with cards with matches first
    return [...sortedWithMatches, ...sortedWithoutMatches];
  }, [cards, sortConfig]);
  
  const filteredCards = React.useMemo(() => {
    if (!filter) return sortedCards;
    
    return sortedCards.filter(card => 
      card.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [sortedCards, filter]);

  // Add option to sort by price
  const handlePriceSort = () => {
    const key = 'price';
    const direction = 
      sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    
    // Custom sort for price
    const sortedByPrice = [...cards].sort((a, b) => {
      const priceA = getCardPrice(a);
      const priceB = getCardPrice(b);
      
      // Handle null/undefined prices
      if (priceA === null && priceB === null) return 0;
      if (priceA === null) return direction === 'asc' ? -1 : 1;
      if (priceB === null) return direction === 'asc' ? 1 : -1;
      
      // Normal comparison
      if (priceA < priceB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (priceA > priceB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setCards(sortedByPrice);
    setSortConfig({ key, direction });
  };
  
  // Helper function to get card price for sorting
  const getCardPrice = (card) => {
    let price = null;
    
    // Try to get price from tcgplayer
    if (card.tcgplayer?.prices) {
      const priceTypes = Object.keys(card.tcgplayer.prices);
      for (const type of priceTypes) {
        if (card.tcgplayer.prices[type]?.market) {
          price = card.tcgplayer.prices[type].market;
          break;
        }
      }
    }
    
    // If no TCGplayer price, try cardmarket
    if (price === null && card.cardmarket?.prices?.averageSellPrice) {
      price = card.cardmarket.prices.averageSellPrice;
    }
    
    return price;
  };

  return (
    <div className="card-list-container">
      <div className="list-content">
        <div className="controls">
          <div className="search">
            <input
              type="text"
              placeholder="Search by name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          <div className="sort-controls">
            <button 
              onClick={() => handleSort('elo')}
              className={sortConfig.key === 'elo' ? 'active' : ''}
            >
              Sort by Elo
              {sortConfig.key === 'elo' && (
                <span>{sortConfig.direction === 'desc' ? ' ↓' : ' ↑'}</span>
              )}
            </button>
            
            <button 
              onClick={() => handleSort('name')}
              className={sortConfig.key === 'name' ? 'active' : ''}
            >
              Sort by Name
              {sortConfig.key === 'name' && (
                <span>{sortConfig.direction === 'desc' ? ' ↓' : ' ↑'}</span>
              )}
            </button>
            
            <button 
              onClick={() => handleSort('matches')}
              className={sortConfig.key === 'matches' ? 'active' : ''}
            >
              Sort by Matches
              {sortConfig.key === 'matches' && (
                <span>{sortConfig.direction === 'desc' ? ' ↓' : ' ↑'}</span>
              )}
            </button>
            
            <button 
              onClick={handlePriceSort}
              className={sortConfig.key === 'price' ? 'active' : ''}
            >
              Sort by Price
              {sortConfig.key === 'price' && (
                <span>{sortConfig.direction === 'desc' ? ' ↓' : ' ↑'}</span>
              )}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading cards...</div>
        ) : (
          <div className="card-grid">
            {filteredCards.map((card, index) => (
              <div key={card.id} className="card-list-item">
                <div className="card-rank">#{index + 1}</div>
                <Card 
                  card={card} 
                  showDetails={true}
                  showMarketPrice={true} // Explicitly set to true
                />
              </div>
            ))}
            
            {filteredCards.length === 0 && (
              <div className="no-results">No cards found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardListView;