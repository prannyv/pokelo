// api.js
// This file contains API calls that load from a local JSON file
// rather than making backend API calls

// Import the card data directly
// Note: In development, this will be imported at build time
import cardData from '../data/cards.json';

// In-memory "database" to store card data with Elo ratings
let cards = [];

// Function to calculate initial Elo based on market price
const calculateInitialElo = (card) => {
  // Default to 1200 if we can't determine price
  const defaultElo = 1200;
  
  // Extract market price if available
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
  
  // If no price found, return default Elo
  if (marketPrice === null) {
    return defaultElo;
  }
  
  // Statistics from the dataset
  const meanPrice = 25.34;
  const medianPrice = 7.89;
  const stdDevPrice = 79.51;
  
  // Use a logarithmic scale to handle the extreme price range
  // This dampens the effect of very expensive cards while still giving them higher ratings
  const logPrice = Math.log(marketPrice + 1); // Add 1 to handle $0 prices
  const logMean = Math.log(meanPrice + 1);
  
  // Base formula: default Elo + adjustment based on price relative to median
  // Cards at median price will have approximately 1200 Elo
  // We use log scale to avoid extreme Elo values for very expensive cards
  let initialElo = defaultElo + 200 * (logPrice - logMean) / logMean;
  
  // Clamp the Elo value to a reasonable range (900-1700)
  initialElo = Math.max(900, Math.min(1700, initialElo));
  
  // Round to the nearest integer
  return Math.round(initialElo);
};

// Function to load Elo data from localStorage
const loadEloData = () => {
  try {
    const savedEloData = localStorage.getItem('pokemonCardEloData');
    return savedEloData ? JSON.parse(savedEloData) : {};
  } catch (error) {
    console.error('Failed to load Elo data from localStorage:', error);
    return {};
  }
};

// Function to save Elo data to localStorage
const saveEloData = (eloData) => {
  try {
    localStorage.setItem('pokemonCardEloData', JSON.stringify(eloData));
  } catch (error) {
    console.error('Failed to save Elo data to localStorage:', error);
  }
};

// Try to retrieve favorites from localStorage
const loadFavorites = () => {
  try {
    const savedFavorites = localStorage.getItem('pokemonCardFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : {};
  } catch (error) {
    console.error('Failed to load favorites from localStorage:', error);
    return {};
  }
};

// Save favorites to localStorage
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem('pokemonCardFavorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites to localStorage:', error);
  }
};

// Initialize favorites
let favorites = loadFavorites();

// Initialize Elo data from localStorage
let eloData = loadEloData();

// Initialize cards with Elo data on first load
const initializeCards = () => {
    if (cards.length === 0) {
      cards = cardData.cards.map(card => {
        // Get stored Elo data if available
        const storedEloData = eloData[card.id];
        
        // Generate initial Elo based on market price if no stored data
        const initialElo = calculateInitialElo(card);
        
        return {
          id: card.id,
          name: card.name,
          imageUrl: card.images?.large || card.images?.small || '/images/placeholder.jpg',
          // Use stored Elo data if available, otherwise use calculated or provided value
          elo: storedEloData?.elo || card.elo || initialElo,
          matches: storedEloData?.matches || card.matches || 0,
          wins: storedEloData?.wins || card.wins || 0,
          lastUpdated: storedEloData?.lastUpdated || card.lastUpdated || new Date().toISOString(),
          isFavorite: favorites[card.id] || false, // Add favorite status
          // Add additional card details that might be useful
          types: card.types || [],
          supertype: card.supertype,
          subtypes: card.subtypes,
          hp: card.hp,
          rarity: card.rarity,
          // Include TCGplayer and Cardmarket data for URL linking
          tcgplayer: card.tcgplayer || null,
          cardmarket: card.cardmarket || null
        };
      });
    }
    return cards;
  };
  
/**
 * Fetch all Pokémon cards with their Elo ratings
 * @returns {Promise<Array>} Array of card objects
 */
export const fetchAllCards = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Initialize cards if not already done
    const allCards = initializeCards();
    return [...allCards]; // Return a copy to prevent accidental mutation
  } catch (error) {
    console.error('Failed to fetch all cards:', error);
    throw error;
  }
};

/**
 * Fetch a specific number of random cards
 * @param {number} count - Number of random cards to fetch
 * @returns {Promise<Array>} Array of card objects
 */
export const fetchRandomCards = async (count = 2) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const allCards = initializeCards();
    
    // Shuffle array and take first 'count' items
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    const randomCards = shuffled.slice(0, count);
    
    return randomCards;
  } catch (error) {
    console.error('Failed to fetch random cards:', error);
    throw error;
  }
};

/**
 * Update a card's Elo rating and other properties
 * @param {string} cardId - The ID of the card to update
 * @param {Object} cardData - The updated card data
 * @returns {Promise<Object>} Updated card object
 */
export const updateCardElo = async (cardId, cardData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const allCards = initializeCards();
    const cardIndex = allCards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    // Update the card
    allCards[cardIndex] = {
      ...allCards[cardIndex],
      elo: cardData.elo,
      matches: cardData.matches,
      wins: cardData.wins,
      lastUpdated: new Date().toISOString()
    };
    
    // Update Elo data in memory
    eloData[cardId] = {
      elo: cardData.elo,
      matches: cardData.matches,
      wins: cardData.wins,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    saveEloData(eloData);
    
    // Return a copy of the updated card
    return { ...allCards[cardIndex] };
  } catch (error) {
    console.error(`Failed to update card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Toggle favorite status for a card
 * @param {string} cardId - The ID of the card to toggle favorite status
 * @returns {Promise<Object>} Updated card object
 */
export const toggleFavorite = async (cardId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    const allCards = initializeCards();
    const cardIndex = allCards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    // Toggle favorite status
    const newFavoriteStatus = !allCards[cardIndex].isFavorite;
    
    // Update the card
    allCards[cardIndex] = {
      ...allCards[cardIndex],
      isFavorite: newFavoriteStatus
    };
    
    // Update favorites in memory and localStorage
    if (newFavoriteStatus) {
      favorites[cardId] = true;
    } else {
      delete favorites[cardId];
    }
    saveFavorites(favorites);
    
    // Return a copy of the updated card
    return { ...allCards[cardIndex] };
  } catch (error) {
    console.error(`Failed to toggle favorite for card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Fetch a specific card by ID
 * @param {string} cardId - The ID of the card to fetch
 * @returns {Promise<Object>} Card object
 */
export const fetchCardById = async (cardId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const allCards = initializeCards();
    const card = allCards.find(c => c.id === cardId);
    
    if (!card) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    // Return a copy of the card
    return { ...card };
  } catch (error) {
    console.error(`Failed to fetch card ${cardId}:`, error);
    throw error;
  }
};

/**
 * Clear all Elo data from localStorage (for testing/resetting)
 * @returns {Promise<void>}
 */
export const resetAllEloData = async () => {
  try {
    // Clear localStorage
    localStorage.removeItem('pokemonCardEloData');
    
    // Reset in-memory data
    eloData = {};
    
    // Reset cards array to force reinitialization
    cards = [];
    
    console.log('All Elo data has been reset');
  } catch (error) {
    console.error('Failed to reset Elo data:', error);
    throw error;
  }
};