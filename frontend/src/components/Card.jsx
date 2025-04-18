// Card.jsx
import React, { useState } from 'react';

const Card = ({ 
  card, 
  onClick, 
  showDetails = false,
  showMarketPrice = false,
  isComparisonMode = false,
  onCardClick = null // New prop for handling card clicks in list view
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (!card) return <div className="card-placeholder">Loading card...</div>;

  const handleImageError = () => {
    setImageError(true);
  };

  // Function to get market price
  const getMarketPrice = () => {
    let marketPrice = null;
    
    // Try to get price from tcgplayer data
    if (card.tcgplayer?.prices) {
      // Check different price categories (holofoil, normal, etc.)
      const priceTypes = Object.keys(card.tcgplayer.prices);
      for (const type of priceTypes) {
        if (card.tcgplayer.prices[type]?.market) {
          marketPrice = card.tcgplayer.prices[type].market;
          break; // Use the first available market price
        }
      }
    }
    
    // If no TCGplayer market price, try cardmarket
    if (marketPrice === null && card.cardmarket?.prices?.averageSellPrice) {
      marketPrice = card.cardmarket.prices.averageSellPrice;
    }
    
    return marketPrice !== null ? `$${marketPrice.toFixed(2)}` : 'N/A';
  };

  // Handler for card clicks that checks the context (comparison mode vs list view)
  const handleCardClick = () => {
    if (isComparisonMode && onClick) {
      // In comparison mode, use the existing onClick handler
      onClick(card.id);
    } else if (!isComparisonMode && onCardClick) {
      // In list view mode, use the new onCardClick handler
      onCardClick(card);
    }
  };

  return (
    <div 
      className={`card ${isComparisonMode ? 'comparison-card' : 'list-card'} ${!isComparisonMode ? 'clickable-card' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-image-container">
        {imageError ? (
          <div className="card-image-placeholder">
            <div className="card-name-placeholder">{card.name}</div>
          </div>
        ) : (
          <img 
            src={card.imageUrl} 
            alt={`${card.name} card`} 
            className="card-image" 
            onError={handleImageError}
          />
        )}
      </div>
      
      {showDetails && (
        <div className="card-details">
          <h3>{card.name}</h3>
          <div className="card-stats">
            <div className="stat">
              <span className="stat-label">Elo:</span>
              <span className="stat-value">{Math.round(card.elo)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Matches:</span>
              <span className="stat-value">{card.matches}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Win Rate:</span>
              <span className="stat-value">
                {card.matches > 0 
                  ? `${Math.round((card.wins / card.matches) * 100)}%` 
                  : 'N/A'}
              </span>
            </div>
            {showMarketPrice && (
              <div className="stat">
                <span className="stat-label">Price:</span>
                <span className="stat-value price">{getMarketPrice()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;