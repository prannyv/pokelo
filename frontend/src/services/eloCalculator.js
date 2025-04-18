// eloCalculator.js
// This file contains the Elo rating calculation logic

/**
 * K-factor determines how much the Elo rating can change after a single match
 * Higher values allow for more dramatic rating changes
 * 
 * In chess:
 * - 40 for new players (< 30 games)
 * - 20 for players under 2400 rating
 * - 10 for players above 2400 rating
 */
const getKFactor = (currentElo, matches) => {
    // For Pokémon cards, we can use a custom K-factor system:
    if (matches < 10) {
      return 50; // New cards change rating quickly
    } else if (matches < 50) {
      return 40; // Still fairly new cards
    } else if (currentElo < 1800) {
      return 30; // Regular cards
    } else {
      return 20; // High-rated cards change more slowly
    }
  };
  
  /**
   * Calculate the expected score (probability of winning)
   * @param {number} elo1 - Elo rating of player 1
   * @param {number} elo2 - Elo rating of player 2
   * @returns {number} Expected score (between 0 and 1)
   */
  export const calculateExpectedScore = (elo1, elo2) => {
    return 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
  };
  
  /**
   * Calculate new Elo ratings for both players after a match
   * @param {number} winnerElo - Current Elo rating of the winner
   * @param {number} loserElo - Current Elo rating of the loser
   * @param {number} winnerMatches - Number of matches the winner has played
   * @param {number} loserMatches - Number of matches the loser has played
   * @returns {Array} Array with two elements: [newWinnerElo, newLoserElo]
   */
  export const calculateNewElos = (
    winnerElo, 
    loserElo, 
    winnerMatches = 0, 
    loserMatches = 0
  ) => {
    // Expected scores (probability of winning)
    const expectedWinner = calculateExpectedScore(winnerElo, loserElo);
    const expectedLoser = calculateExpectedScore(loserElo, winnerElo);
    
    // Actual scores (1 for win, 0 for loss)
    const actualWinner = 1;
    const actualLoser = 0;
    
    // K-factors for each player
    const kFactorWinner = getKFactor(winnerElo, winnerMatches);
    const kFactorLoser = getKFactor(loserElo, loserMatches);
    
    // Calculate new Elo ratings
    const newWinnerElo = winnerElo + kFactorWinner * (actualWinner - expectedWinner);
    const newLoserElo = loserElo + kFactorLoser * (actualLoser - expectedLoser);
    
    return [newWinnerElo, newLoserElo];
  };
  
  /**
   * Initialize a new card with default Elo rating
   * @returns {number} Default Elo rating for new cards
   */
  export const getDefaultElo = () => {
    return 1200; // Standard starting Elo
  };