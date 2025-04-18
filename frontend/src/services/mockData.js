// mockData.js
// This file contains mock data for development and testing

export const mockCards = [
    {
      id: "1",
      name: "Charizard",
      imageUrl: "https://images.pokemontcg.io/base1/4.png",
      series: "Base Set",
      elo: 1850,
      matches: 145,
      wins: 102,
      lastUpdated: "2025-04-10T15:32:21.542Z"
    },
    {
      id: "2",
      name: "Blastoise",
      imageUrl: "https://images.pokemontcg.io/base1/2.png",
      series: "Base Set",
      elo: 1790,
      matches: 132,
      wins: 87,
      lastUpdated: "2025-04-09T11:27:18.112Z"
    },
    {
      id: "3",
      name: "Venusaur",
      imageUrl: "https://images.pokemontcg.io/base1/15.png",
      series: "Base Set",
      elo: 1710,
      matches: 127,
      wins: 76,
      lastUpdated: "2025-04-11T09:45:32.837Z"
    },
    {
      id: "4",
      name: "Pikachu",
      imageUrl: "https://images.pokemontcg.io/base1/58.png",
      series: "Base Set",
      elo: 1680,
      matches: 167,
      wins: 94,
      lastUpdated: "2025-04-12T14:12:05.221Z"
    },
    {
      id: "5",
      name: "Mewtwo",
      imageUrl: "https://images.pokemontcg.io/base1/10.png",
      series: "Base Set",
      elo: 1830,
      matches: 156,
      wins: 105,
      lastUpdated: "2025-04-08T16:54:19.653Z"
    },
    {
      id: "6",
      name: "Gyarados",
      imageUrl: "https://images.pokemontcg.io/base1/6.png",
      series: "Base Set",
      elo: 1750,
      matches: 121,
      wins: 79,
      lastUpdated: "2025-04-09T13:34:01.456Z"
    },
    {
      id: "7",
      name: "Alakazam",
      imageUrl: "https://images.pokemontcg.io/base1/1.png",
      series: "Base Set",
      elo: 1690,
      matches: 118,
      wins: 72,
      lastUpdated: "2025-04-10T10:28:45.912Z"
    },
    {
      id: "8",
      name: "Snorlax",
      imageUrl: "https://images.pokemontcg.io/base2/11.png",
      series: "Jungle",
      elo: 1720,
      matches: 129,
      wins: 82,
      lastUpdated: "2025-04-11T17:43:02.541Z"
    },
    {
      id: "9",
      name: "Jolteon",
      imageUrl: "https://images.pokemontcg.io/base2/4.png",
      series: "Jungle",
      elo: 1680,
      matches: 112,
      wins: 69,
      lastUpdated: "2025-04-07T15:21:37.789Z"
    },
    {
      id: "10",
      name: "Zapdos",
      imageUrl: "https://images.pokemontcg.io/base1/16.png",
      series: "Base Set",
      elo: 1770,
      matches: 135,
      wins: 92,
      lastUpdated: "2025-04-10T09:14:53.268Z"
    },
    {
      id: "11",
      name: "Dragonite",
      imageUrl: "https://images.pokemontcg.io/fossil/4.png",
      series: "Fossil",
      elo: 1800,
      matches: 142,
      wins: 98,
      lastUpdated: "2025-04-09T12:11:25.753Z"
    },
    {
      id: "12",
      name: "Mew",
      imageUrl: "https://images.pokemontcg.io/base3/10.png",
      series: "Promo",
      elo: 1820,
      matches: 151,
      wins: 103,
      lastUpdated: "2025-04-11T08:37:49.124Z"
    }
  ];
  
  /**
   * Get two random cards from the mock data
   * @param {number} count - Number of random cards to return (default: 2)
   * @returns {Array} Array of random card objects
   */
  export const getRandomCards = (count = 2) => {
    const shuffled = [...mockCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  /**
   * Get all cards from the mock data
   * @returns {Array} Array of all card objects
   */
  export const getAllCards = () => {
    return [...mockCards];
  };
  
  /**
   * Update a card in the mock data
   * @param {string} cardId - ID of the card to update
   * @param {Object} updatedData - New card data
   * @returns {Object} Updated card
   */
  export const updateCard = (cardId, updatedData) => {
    const cardIndex = mockCards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error(`Card with ID ${cardId} not found`);
    }
    
    // Update the card in our mock data
    mockCards[cardIndex] = {
      ...mockCards[cardIndex],
      ...updatedData,
      lastUpdated: new Date().toISOString()
    };
    
    return mockCards[cardIndex];
  };