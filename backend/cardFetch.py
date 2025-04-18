import requests
import json
import os
import time
from pathlib import Path

# Configuration
API_KEY = ""
API_BASE_URL = "https://api.pokemontcg.io/v2/cards"
HEADERS = {"X-Api-Key": API_KEY}
RATE_LIMIT_DELAY = 0.1  # 100ms delay between requests to respect API rate limits
OUTPUT_DIR = "card_data_with_prices"

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

def load_card_set(file_path):
    """Load card set from a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def fetch_card_data(card_id):
    """Fetch card data from the API."""
    url = f"{API_BASE_URL}/{card_id}"
    
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        print(f"Successfully fetched data for card {card_id}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for card {card_id}: {e}")
        return None

def process_card_sets(set_file_paths):
    """Process multiple card sets."""
    for set_file_path in set_file_paths:
        set_name = Path(set_file_path).stem
        output_file = os.path.join(OUTPUT_DIR, f"{set_name}_with_prices.json")
        
        # Load the card set
        cards = load_card_set(set_file_path)
        
        # If the file contains a data structure with a 'cards' key
        if isinstance(cards, dict) and 'cards' in cards:
            cards_list = cards['cards']
        else:
            cards_list = cards  # Assume it's already a list of cards
        
        # Fetch data for each card
        enriched_cards = []
        
        for card in cards_list:
            card_id = card.get('id')
            
            if not card_id:
                print(f"Warning: Card without ID found in {set_name}, skipping")
                continue
            
            # Fetch card data with pricing
            card_data = fetch_card_data(card_id)
            
            if card_data:
                enriched_cards.append(card_data.get('data', {}))
            
            # Respect API rate limits
            time.sleep(RATE_LIMIT_DELAY)
        
        # Save enriched data
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({"cards": enriched_cards}, f, indent=2)
        
        print(f"Saved enriched data for {set_name} to {output_file}")

def main():
    # Get all JSON files in the directory that might contain card sets
    # Replace with your actual directory containing the card set JSON files
    card_set_dir = "card_sets"
    set_file_paths = [os.path.join(card_set_dir, f) for f in os.listdir(card_set_dir) 
                     if f.endswith('.json') and os.path.isfile(os.path.join(card_set_dir, f))]
    
    if not set_file_paths:
        print(f"No JSON files found in {card_set_dir}")
        return
    
    print(f"Found {len(set_file_paths)} card set files to process")
    process_card_sets(set_file_paths)
    print("All card sets processed!")

if __name__ == "__main__":
    main()