import json
import os
import shutil
from pathlib import Path

# Configuration
INPUT_DIR = "card_data_with_prices"
OUTPUT_DIR = "rare_card_data"

# List of rarities to keep
RARE_RARITIES = [
    "Ultra Rare",
    "Hyper Rare",
    "Illustration Rare",
    "Special Illustration Rare"
]

def filter_rare_cards():
    """
    Process all JSON files in the input directory and filter cards based on rarity.
    Save filtered cards to the output directory.
    """
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Get all JSON files in the input directory
    json_files = [f for f in os.listdir(INPUT_DIR) if f.endswith('.json') and os.path.isfile(os.path.join(INPUT_DIR, f))]
    
    if not json_files:
        print(f"No JSON files found in {INPUT_DIR}")
        return
    
    print(f"Found {len(json_files)} JSON files to process")
    
    for filename in json_files:
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename.replace("_with_prices", "_rare"))
        
        try:
            # Load the card data
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if the expected structure exists
            if not isinstance(data, dict) or 'cards' not in data:
                print(f"Warning: Unexpected format in {filename}, skipping")
                continue
            
            # Filter cards by rarity
            rare_cards = []
            total_cards = len(data['cards'])
            
            for card in data['cards']:
                # Check if rarity is in our list of rare rarities
                if card.get('rarity') in RARE_RARITIES:
                    rare_cards.append(card)
            
            # Create new data structure with only rare cards
            filtered_data = {
                "cards": rare_cards
            }
            
            # Save filtered data
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(filtered_data, f, indent=2)
            
            print(f"Processed {filename}: Kept {len(rare_cards)} out of {total_cards} cards")
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

def main():
    print("Starting rare card filtering process...")
    
    # Check if input directory exists
    if not os.path.exists(INPUT_DIR):
        print(f"Error: Input directory '{INPUT_DIR}' does not exist.")
        print("Please run the previous script first to create the card_data_with_prices directory.")
        return
    
    filter_rare_cards()
    print("Rare card filtering complete!")

if __name__ == "__main__":
    main()