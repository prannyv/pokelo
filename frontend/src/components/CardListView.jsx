// CardListView.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card';
import FavoriteButton from './FavoriteButton';
import { fetchAllCards, toggleFavorite } from '../services/api';

const CardListView = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: 'elo',
    direction: 'desc'
  });
  const [filter, setFilter] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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

  const handleToggleFavorite = async (cardId) => {
    try {
      const updatedCard = await toggleFavorite(cardId);
      
      // Update the cards array with the updated card
      setCards(currentCards => 
        currentCards.map(card => 
          card.id === cardId ? { ...card, isFavorite: updatedCard.isFavorite } : card
        )
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Function to handle card click
  const handleCardClick = (card) => {
    // Check if the card has a TCGplayer URL
    if (card.tcgplayer?.url) {
      // Open the TCGplayer URL in a new tab
      window.open(card.tcgplayer.url, '_blank', 'noopener,noreferrer');
    } else {
      console.log('No TCGplayer URL available for this card');
    }
  };

  const sortedCards = React.useMemo(() => {
    if (!cards.length) return [];
    
    const sortableCards = [...cards];
    
    // First, separate favorited cards from non-favorited ones
    const favoritedCards = sortableCards.filter(card => card.isFavorite);
    const nonFavoritedCards = sortableCards.filter(card => !card.isFavorite);
    
    // Within each group, separate cards with matches from those without
    const favoritedWithMatches = favoritedCards.filter(card => card.matches > 0);
    const favoritedWithoutMatches = favoritedCards.filter(card => card.matches === 0);
    const nonFavoritedWithMatches = nonFavoritedCards.filter(card => card.matches > 0);
    const nonFavoritedWithoutMatches = nonFavoritedCards.filter(card => card.matches === 0);
    
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
    
    const sortedFavoritedWithMatches = favoritedWithMatches.sort(sortFn);
    const sortedFavoritedWithoutMatches = favoritedWithoutMatches.sort(sortFn);
    const sortedNonFavoritedWithMatches = nonFavoritedWithMatches.sort(sortFn);
    const sortedNonFavoritedWithoutMatches = nonFavoritedWithoutMatches.sort(sortFn);
    
    // Return the combined array with favorited cards first, then each group in order
    return [
      ...sortedFavoritedWithMatches, 
      ...sortedFavoritedWithoutMatches,
      ...sortedNonFavoritedWithMatches, 
      ...sortedNonFavoritedWithoutMatches
    ];
  }, [cards, sortConfig]);
  
  const filteredCards = React.useMemo(() => {
    let filtered = sortedCards;
    
    // Apply name filter
    if (filter) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    // Apply favorites-only filter if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter(card => card.isFavorite);
    }
    
    return filtered;
  }, [sortedCards, filter, showFavoritesOnly]);

  return (
    <div className="card-list-container">
      <div className="list-content">
        <div className="controls">
          <div className="search-and-filter">
            <div className="search">
              <input
                type="text"
                placeholder="Search by name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <div className="favorites-filter">
              <label className="favorites-toggle">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                />
                <span>Show favorites only</span>
              </label>
            </div>
          </div>
          
          <div className="sort-controls">
            <button 
              onClick={() => handleSort('elo')}
              className={sortConfig.key === 'elo' ? 'active' : ''}
            >
              Sort by Elo
              {sortConfig.key === 'elo' && (
                <span>{sortConfig.direction === 'desc' ? '↓' : '↑'}</span>
              )}
            </button>
            
            <button 
              onClick={() => handleSort('name')}
              className={sortConfig.key === 'name' ? 'active' : ''}
            >
              Sort by Name
              {sortConfig.key === 'name' && (
                <span>{sortConfig.direction === 'desc' ? '↓' : '↑'}</span>
              )}
            </button>
            
            <button 
              onClick={() => handleSort('matches')}
              className={sortConfig.key === 'matches' ? 'active' : ''}
            >
              Sort by Matches
              {sortConfig.key === 'matches' && (
                <span>{sortConfig.direction === 'desc' ? '↓' : '↑'}</span>
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
                <FavoriteButton 
                  isFavorited={card.isFavorite}
                  onClick={() => handleToggleFavorite(card.id)}
                  position="grid-item"
                />
                <Card 
                  card={card} 
                  showDetails={true}
                  showMarketPrice={true}
                  onCardClick={handleCardClick}
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