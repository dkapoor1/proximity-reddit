import csv
from gensim.models import KeyedVectors
import json
from datetime import datetime, timedelta

# def get_start_index(start_date):
#     base_date = datetime(2024, 8, 6)
#     delta = start_date - base_date
#     return max(0, delta.days)

# Load the GoogleNews Word2Vec model
model = KeyedVectors.load_word2vec_format('GoogleNews-vectors-negative300.bin', binary=True)

# Read the list of nouns from nounlist.csv
with open('nounlist.csv', mode='r', newline='') as file:
    reader = csv.reader(file)
    noun_list = {row[0] for row in reader if row}  # Use a set for faster lookup

# Read theme words from themewords.txt
with open('themewords.txt', 'r') as file:
    theme_words = [line.strip() for line in file]

# Set the start date
start_date = datetime(2024, 11, 22)  # You can change this to any date
start_index = 113 # subtract 1 from the line number

# Calculate the starting index based on the start_date
# start_index = get_start_index(start_date)

for i, target_word in enumerate(theme_words[start_index:], start=start_index):
    # Calculate the current date
    current_date = start_date + timedelta(days=i - start_index)
    output_filename = current_date.strftime('./puzzles/%Y-%m-%d-proximity.json')

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