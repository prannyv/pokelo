import json
import os
import glob
from pathlib import Path

# Configuration
INPUT_DIR = "rare_card_data"
OUTPUT_FILE = "all_rare_cards.json"

def combine_json_files():
    """
    Combine all JSON files in the input directory into a single JSON file.
    """
    # Check if input directory exists
    if not os.path.exists(INPUT_DIR):
        print(f"Error: Input directory '{INPUT_DIR}' does not exist.")
        print("Please run the previous scripts first to create the rare_card_data directory.")
        return False
    
    # Get all JSON files in the input directory
    json_files = glob.glob(os.path.join(INPUT_DIR, "*.json"))
    
    if not json_files:
        print(f"No JSON files found in {INPUT_DIR}")
        return False
    
    print(f"Found {len(json_files)} JSON files to combine")
    
    # Initialize the combined data structure
    all_cards = {
        "cards": []
    }
    
    # Process each JSON file
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, dict) or 'cards' not in data:
                print(f"Warning: Unexpected format in {json_file}, skipping")
                continue
                
            # Add set information to each card
            set_name = Path(json_file).stem
            for card in data['cards']:
                # Optionally, add the source set to each card for reference
                card['source_set'] = set_name
                all_cards['cards'].append(card)
                
            print(f"Added {len(data['cards'])} cards from {Path(json_file).name}")
            
        except Exception as e:
            print(f"Error processing {json_file}: {e}")
    
    # Save combined data to output file
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_cards, f, indent=2)
        
        total_cards = len(all_cards['cards'])
        print(f"Successfully combined {total_cards} cards into {OUTPUT_FILE}")
        return True
        
    except Exception as e:
        print(f"Error saving combined data: {e}")
        return False

def main():
    print("Starting to combine rare card JSON files...")
    success = combine_json_files()
    
    if success:
        print("✅ Card combination complete!")
        print(f"You can now use '{OUTPUT_FILE}' with your Pokémon Card Elo ranking application.")
    else:
        print("❌ Failed to combine card data.")

if __name__ == "__main__":
    main()