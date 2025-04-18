// ComparisonView.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card';
import FavoriteButton from './FavoriteButton';
import { fetchRandomCards, updateCardElo, toggleFavorite } from '../services/api';
import { calculateNewElos } from '../services/eloCalculator';

const ComparisonView = () => {
  const [cards, setCards] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [hoveredSide, setHoveredSide] = useState(null);
  const [selectionMade, setSelectionMade] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);

  // Load two random cards when component mounts
  useEffect(() => {
    loadNewComparison();
  }, []);

  // Add keyboard event listener for arrow keys and space/enter for next button
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle arrow key selection
      if (!loading && !result && !selectionMade) {
        if (event.key === 'ArrowLeft') {
          // Update hover state and select left card
          setHoveredSide('left');
          handleSideClick(cards[0]?.id);
        } else if (event.key === 'ArrowRight') {
          // Update hover state and select right card
          setHoveredSide('right');
          handleSideClick(cards[1]?.id);
        }
      }
      
      // Handle space/enter key for next button
      if (result && (event.key === ' ' || event.key === 'Enter')) {
        loadNewComparison();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cards, loading, result, selectionMade]);

  const loadNewComparison = async () => {
    setLoading(true);
    setResult(null);
    setHoveredSide(null);
    setSelectionMade(false);
    try {
      const randomCards = await fetchRandomCards(2);
      setCards(randomCards);
    } catch (error) {
      console.error("Failed to load cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = async (selectedCardId) => {
    if (loading || result || selectionMade) return;
    
    // Lock selection state
    setSelectionMade(true);
    
    // Increment selection count
    setSelectionCount(prevCount => prevCount + 1);
    
    const winnerIndex = cards[0].id === selectedCardId ? 0 : 1;
    const loserIndex = winnerIndex === 0 ? 1 : 0;
    
    // Set hover state to the winning side
    setHoveredSide(winnerIndex === 0 ? 'left' : 'right');
    
    // Calculate new Elo ratings
    const [newWinnerElo, newLoserElo] = calculateNewElos(
      cards[winnerIndex].elo,
      cards[loserIndex].elo,
      cards[winnerIndex].matches,
      cards[loserIndex].matches
    );
    
    // Create updated card objects
    const updatedWinner = {
      ...cards[winnerIndex],
      elo: newWinnerElo,
      matches: cards[winnerIndex].matches + 1,
      wins: cards[winnerIndex].wins + 1
    };
    
    const updatedLoser = {
      ...cards[loserIndex],
      elo: newLoserElo,
      matches: cards[loserIndex].matches + 1,
      wins: cards[loserIndex].wins
    };
    
    // Update state with new Elo values
    const newCards = [...cards];
    newCards[winnerIndex] = updatedWinner;
    newCards[loserIndex] = updatedLoser;
    setCards(newCards);
    
    // Show result message
    setResult({
      winner: updatedWinner,
      loser: updatedLoser,
      eloChange: Math.abs(newWinnerElo - cards[winnerIndex].elo).toFixed(1)
    });
    
    // Send updates to the backend
    try {
      await Promise.all([
        updateCardElo(updatedWinner.id, updatedWinner),
        updateCardElo(updatedLoser.id, updatedLoser)
      ]);
    } catch (error) {
      console.error("Failed to update Elo ratings:", error);
    }
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

  const handleSideHover = (side) => {
    if (selectionMade) return; // Prevent hover changes after selection
    setHoveredSide(side);
  };

  const handleSideLeave = () => {
    if (selectionMade) return; // Prevent hover changes after selection
    setHoveredSide(null);
  };

  const handleSideClick = (selectedCardId) => {
    handleCardSelection(selectedCardId);
  };

  // Determine if we should show the keyboard hint
  const showKeyboardHint = selectionCount < 3;

  return (
    <div className="comparison-container">
      {loading ? (
        <div className="loading">Loading cards...</div>
      ) : (
        <div className="comparison-content">
          <div className={`split-screen-container ${selectionMade ? 'selection-made' : ''}`}>
            <div 
              className={`split-side left-side ${hoveredSide === 'left' && !selectionMade ? 'hovered' : ''} ${selectionMade && hoveredSide === 'left' ? 'selected' : ''}`}
              onMouseEnter={() => handleSideHover('left')}
              onMouseLeave={handleSideLeave}
              onClick={() => handleSideClick(cards[0].id)}
            >
              {/* Favorite button for left section */}
              <FavoriteButton 
                isFavorited={cards[0]?.isFavorite || false}
                onClick={() => handleToggleFavorite(cards[0]?.id)}
                position="section-left"
              />
              
              <div className="card-container">
                <Card 
                  card={cards[0]} 
                  isComparisonMode={true}
                />
                <div className={`arrow-indicator left ${hoveredSide === 'left' && !selectionMade ? 'hovered' : ''} ${selectionMade && hoveredSide === 'left' ? 'selected' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="split-divider"></div>
            
            <div 
              className={`split-side right-side ${hoveredSide === 'right' && !selectionMade ? 'hovered' : ''} ${selectionMade && hoveredSide === 'right' ? 'selected' : ''}`}
              onMouseEnter={() => handleSideHover('right')}
              onMouseLeave={handleSideLeave}
              onClick={() => handleSideClick(cards[1].id)}
            >
              {/* Favorite button for right section */}
              <FavoriteButton 
                isFavorited={cards[1]?.isFavorite || false}
                onClick={() => handleToggleFavorite(cards[1]?.id)}
                position="section-right"
              />
              
              <div className="card-container">
                <Card 
                  card={cards[1]} 
                  isComparisonMode={true}
                />
                <div className={`arrow-indicator right ${hoveredSide === 'right' && !selectionMade ? 'hovered' : ''} ${selectionMade && hoveredSide === 'right' ? 'selected' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {showKeyboardHint && (
            <div className="keyboard-hint">
              <span>Use ← → arrow keys to select</span>
            </div>
          )}
          
          {result && (
            <div className="result-message-overlay" onClick={loadNewComparison}>
              <div className="result-message">
                <p>
                  <strong>{result.winner.name}</strong> wins! 
                  Elo rating increased by {result.eloChange} points.
                </p>
                <button onClick={(e) => {
                  e.stopPropagation(); // Prevent double triggering
                  loadNewComparison();
                }}>
                  Next Comparison {selectionCount < 3 && "(Space/Enter)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparisonView;