import random
import os

def read_words(filename):
    with open(filename, 'r') as file:
        return [line.strip() for line in file]

def read_existing_theme_words(filename):
    if os.path.exists(filename):
        return set(read_words(filename))
    return set()

def write_words(filename, words):
    with open(filename, 'a') as file:
        for word in words:
            file.write(word + '\n')

# File paths
nounlist_path = './nounlist.csv'
themewords_path = './themewords.txt'

# Read the words from the nounlist file
all_words = read_words(nounlist_path)

# Read existing theme words
existing_theme_words = read_existing_theme_words(themewords_path)

# Randomly select 100 additional words that are not in existing_theme_words
additional_words = []
while len(additional_words) < 100:
    word = random.choice(all_words)
    if word not in existing_theme_words and word not in additional_words:
        additional_words.append(word)

# Write the additional words to the themewords file
write_words(themewords_path, additional_words)

# Print the selected words
print("Added the following 100 words to themewords.txt:")
for word in additional_words:
    print(word)

print(f"\nTotal words in {themewords_path}: {len(existing_theme_words) + 100}")