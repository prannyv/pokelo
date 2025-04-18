// FavoriteButton.jsx
import React from 'react';

const FavoriteButton = ({ isFavorited, onClick, position }) => {
  // Determine position class based on prop
  let positionClass;
  switch(position) {
    case 'section-left':
      positionClass = 'section-left';
      break;
    case 'section-right':
      positionClass = 'section-right';
      break;
    case 'grid-item':
      positionClass = 'grid-item';
      break;
    default:
      positionClass = 'section-right';
  }
  
  return (
    <button 
      className={`favorite-button ${positionClass} ${isFavorited ? 'favorited' : ''}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event from bubbling to parent card
        onClick();
      }}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        width="40" 
        height="40"
      >
        {/* Circle outline - made bigger */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="white" 
          stroke={isFavorited ? "#e0e0e0" : "#e0e0e0"} 
          strokeWidth="2" 
        />
        
        {/* Heart icon - moved down by another 5px */}
        <path 
          d="M50,75 C48.6,75 47.2,74.5 46,73.4 C39.8,68.2 32,60.4 28,54.4 C25.5,50.4 24,46.5 24,43 C24,35.8 29.8,30 37,30 C41.4,30 45.9,32.4 48.7,36.3 C49.2,37.1 50.8,37.1 51.3,36.3 C54.1,32.4 58.6,30 63,30 C70.2,30 76,35.8 76,43 C76,46.5 74.5,50.4 72,54.4 C68,60.4 60.2,68.2 54,73.4 C52.8,74.5 51.4,75 50,75 Z"
          fill={isFavorited ? "#FF0000" : "none"}
          stroke={isFavorited ? "none" : "#999"}
          strokeWidth="2.5"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;