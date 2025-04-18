import json
import statistics
import numpy as np

def analyze_card_market_prices(file_path="all_rare_cards.json"):
    """
    Analyze the market prices of rare Pokémon cards.
    Focuses specifically on the 'market' price datapoint.
    """
    try:
        # Load the combined JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, dict) or 'cards' not in data:
            print("Error: Unexpected format in the JSON file")
            return
        
        cards = data['cards']
        print(f"Analyzing market prices for {len(cards)} rare Pokémon cards...")
        
        # Extract market prices only
        market_prices = []
        cards_with_market_prices = 0
        cards_missing_prices = 0
        
        for card in cards:
            has_market_price = False
            
            # Check if card has tcgplayer pricing data
            if 'tcgplayer' in card and 'prices' in card['tcgplayer']:
                price_data = card['tcgplayer']['prices']
                
                # Look for different pricing categories
                price_categories = [
                    'normal', 'holofoil', 'reverseHolofoil', 
                    'firstEditionHolofoil', 'firstEditionNormal'
                ]
                
                for category in price_categories:
                    if category in price_data and price_data[category] is not None:
                        # Get ONLY market price
                        if 'market' in price_data[category] and price_data[category]['market']:
                            market_prices.append(price_data[category]['market'])
                            has_market_price = True
                            break  # Use the first category with a valid market price
            
            if has_market_price:
                cards_with_market_prices += 1
            else:
                cards_missing_prices += 1
        
        if not market_prices:
            print("No market price data found in the cards")
            return
        
        # Calculate statistics
        mean_price = statistics.mean(market_prices)
        median_price = statistics.median(market_prices)
        std_dev = statistics.stdev(market_prices) if len(market_prices) > 1 else 0
        
        # Calculate percentiles for bounds
        lower_bound = np.percentile(market_prices, 10)  # 10th percentile
        upper_bound = np.percentile(market_prices, 90)  # 90th percentile
        
        # Find min and max prices
        min_price = min(market_prices)
        max_price = max(market_prices)
        
        # Find most valuable cards (top 5)
        top_cards = []
        for card in cards:
            market_price = None
            
            if 'tcgplayer' in card and 'prices' in card['tcgplayer']:
                price_data = card['tcgplayer']['prices']
                
                for category in price_categories:
                    if category in price_data and price_data[category] is not None:
                        if 'market' in price_data[category] and price_data[category]['market']:
                            market_price = price_data[category]['market']
                            break  # Use the first category with a valid market price
            
            if market_price is not None:
                top_cards.append((card.get('name', 'Unknown'), market_price, card.get('rarity', 'Unknown')))
        
        # Sort and get top 5
        top_cards.sort(key=lambda x: x[1], reverse=True)
        top_5 = top_cards[:5]
        
        # Print the results
        print("\n=== MARKET PRICE ANALYSIS RESULTS ===")
        print(f"Cards analyzed: {len(cards)}")
        print(f"Cards with market price data: {cards_with_market_prices}")
        print(f"Cards missing market price data: {cards_missing_prices}")
        
        print(f"\nMean market price: ${mean_price:.2f}")
        print(f"Median market price: ${median_price:.2f}")
        print(f"Standard deviation: ${std_dev:.2f}")
        
        print(f"\nLower bound (10th percentile): ${lower_bound:.2f}")
        print(f"Upper bound (90th percentile): ${upper_bound:.2f}")
        
        print(f"\nMarket price range: ${min_price:.2f} - ${max_price:.2f}")
        
        print("\nTop 5 most valuable cards (by market price):")
        for i, (name, price, rarity) in enumerate(top_5, 1):
            print(f"{i}. {name} ({rarity}): ${price:.2f}")
            
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{file_path}'")
    except Exception as e:
        print(f"Error analyzing prices: {e}")

if __name__ == "__main__":
    analyze_card_market_prices()