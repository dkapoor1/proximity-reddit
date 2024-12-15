# 🎯 Proximity: A Global Word Guessing Game

**Proximity** is a live word game where Reddit users worldwide compete to guess the secret word first.

---

## 🚀 How It Works

- **Meaning over spelling**: This game isn’t about how words sound or are spelled; it’s about their *meaning*. The AI ranks your guesses based on how contextually similar they are to the secret word.
- **The ranking system**: Each guess you make gets a rank. A lower rank means you're closer to the secret word. The ultimate goal? Guess the word ranked at #1!
- **Compete live**: The best 18 guesses from players all over the globe are displayed in real-time.

### 📝 Quick Game Rules 
1. Type in a word you think is similar to the secret word.
2. After each guess, you’ll see a rank:
   - The lower the rank, the better.
   - Rank #1? You found the secret word!
3. Aim to be the first to crack it and claim your spot on the Leaderboard.

---

## 🛠️ What’s Inside This Repo?

This repository powers Proximity, with the following key components:

### **1. word2vec-env/ Directory**
Here, you’ll find the scripts responsible for calculating the AI-driven similarity scores, written in Python.

### **2. src/ Directory** 💻
The core files for the Proximity app, built with [Devvit](https://developers.reddit.com/). These include:
- **Game logic** (like scoring and rankings)
- **Custom UI elements** (reusable components like `StyledBox.tsx`)
- **Overlays** (like `HowToPlay.tsx`)

---

## 👨‍💻 Devvit & the Reddit Hackathon

This app was built for the [Reddit Games and Puzzles Hackathon](https://redditgamesandpuzzles.devpost.com/) using **Devvit**, a framework for creating dynamic Reddit experiences.

With **Devvit**, we:
- Created a custom post type for the game.
- Enabled real-time updates for players worldwide.
- Hooked into Reddit APIs for a seamless in-app experience.

---

## ❤️ Why You'll Love Proximity

- **Accessible**: Play right from Reddit—no downloads or installations needed!
- **Social**: Compete with Redditors globally and see live rankings. 
- **Challenging**:  Guessing the secret word isn't easy. But your fellow Redditors should help get you there.

---

## 🎮 Ready to Play?
Head to [r/playproximity](https://reddit.com/r/playproximity/) and start guessing!