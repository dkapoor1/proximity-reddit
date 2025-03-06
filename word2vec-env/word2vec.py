import csv
from gensim.models import KeyedVectors
import json
from datetime import datetime, timedelta

# Load the GoogleNews Word2Vec model
model = KeyedVectors.load_word2vec_format('./GoogleNews-vectors-negative300.bin', binary=True)

# Read the list of nouns from nounlist.csv
with open('nounlist.csv', mode='r', newline='') as file:
    reader = csv.reader(file)
    noun_list = {row[0] for row in reader if row}  # Use a set for faster lookup

# Read theme words from themewords.txt
with open('themewords.txt', 'r') as file:
    theme_words = [line.strip() for line in file]

# Set the starting index
start_index = 982  # Adjust based on the required starting point

# Initialize a counter for the output file numbering
file_counter = 982

for i, target_word in enumerate(theme_words[start_index:], start=start_index):
    # Generate the output filename with incremental numbering
    output_filename = f'./puzzles/proximity_devvit_{file_counter}.json'

    # Check if the target word is in the model
    if target_word in model:
        # Calculate similarities only for words in noun_list that are also in the model's vocabulary
        similarities = {
            word: model.similarity(target_word, word)
            for word in noun_list if word in model
        }

        # Sort words by similarity and select the top 6800
        sorted_similar_words = sorted(similarities.items(), key=lambda item: item[1], reverse=True)[:6800]
        word_list = [word for word, similarity in sorted_similar_words]

        # Save the sorted list of words to a JSON file
        with open(output_filename, 'w') as json_file:
            json.dump({"rankings": word_list}, json_file)
        
        print(f"Processed '{target_word}' and saved results to {output_filename}")
    else:
        print(f"The word '{target_word}' is not in the model.")
    
    # Increment the file counter for the next file
    file_counter += 1
