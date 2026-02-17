# Family Feud Game

An online Family Feud game implementation that mimics the popular TV game show.

## Features

- **Team Management**: Name your two teams at the start of the game
- **Score Tracking**: Automatic score tallying for both teams across rounds
- **3 Rounds**: Game loops through up to 3 rounds automatically
- **Sound Effects**: 
  - Correct answer "ding" sound when answers are revealed
  - Wrong answer "buzzer" sound with X mark display
    - Optional round intro theme played at the start of each round
- **Interactive Gameplay**: Click on answers to reveal them
- **Customizable Questions**: Easy to modify questions and survey responses

## How to Play

1. Open `index.html` in a web browser
2. Enter names for Team 1 and Team 2
3. Click "Start Game"
4. Click on numbered answer boxes to reveal answers
5. Press 'X' key for wrong answers (shows X mark and plays buzzer)
6. Scores are automatically tallied as answers are revealed
7. Complete 3 rounds to see the final winner

## Game Flow

- **Round 1**: Points go to Team 1
- **Round 2**: Points go to Team 2  
- **Round 3**: Points go to Team 1
- After 3 rounds, the team with the highest score wins!

## Customizing Questions

Edit the `defaultQuestions` array in `game.js` to add your own questions and survey responses:

```javascript
const defaultQuestions = [
    {
        question: "Your question here",
        answers: [
            { text: "Answer 1", points: 45 },
            { text: "Answer 2", points: 30 },
            // ... up to 5 answers per question
        ]
    },
    // Add more questions for additional rounds
];
```

## Files

- `index.html` - Main game interface
- `game.js` - Game logic and functionality
- `style.css` - Game styling and animations

## Media Assets

- Add your round-start music file as `media/round_theme.m4a`
- The game will automatically play this file at the beginning of each round

## Technologies Used

- HTML5
- CSS3 (with animations)
- JavaScript (ES6+)
- Web Audio API for sound effects

## Browser Compatibility

Works on modern browsers that support:
- ES6 JavaScript
- Web Audio API
- CSS Grid and Flexbox

Tested on Chrome, Firefox, Safari, and Edge.