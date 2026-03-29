# Family Feud Game

An online Family Feud game implementation that mimics the popular TV game show.

## Features

- **Team Management**: Name your two teams at the start of the game
- **Score Tracking**: Automatic score tallying for both teams across rounds
- **Race to Win**: First team to reach the winning score (default `200`) wins immediately
- **3 Rounds**: Game loops through up to 3 rounds automatically
- **Sound Effects**: 
  - Correct answer "ding" sound when answers are revealed
  - Wrong answer "buzzer" sound with X mark display
    - Optional round intro theme played at the start of each round
- **Interactive Gameplay**: Click on answers to reveal them
- **Importable Question Sets**: Load a Family Feud question bank from a JSON file
- **Bundled Default Questions**: Ships with a reusable sample file in `default-question-set.json`

## How to Play

1. Open `index.html` in a web browser
2. Enter names for Team 1 and Team 2
3. If needed, click `Import Question Set` and choose a JSON question-set file
4. Click "Start Game"
5. The first round starts with a faceoff: both teams give one answer, and the higher-ranked answer wins control
6. Click on numbered answer boxes to reveal answers
7. Press 'X' key for wrong answers (shows X mark and plays buzzer) after control is established
8. Scores are automatically tallied as answers are revealed
9. Complete all rounds to see the final winner

## Game Flow

- The **first round only** starts with a faceoff where both teams answer once.
- The team with the higher-ranked revealed answer takes control of the board.
- Faceoff misses do not add strike marks.
- Later rounds begin with the active team already in control.
- The first team to reach **200 points** wins and the game ends immediately.
- After **3 strikes**, the opposing team gets **one steal guess**:
    - If the steal guess matches any listed survey response, the stealing team wins that round's points.
    - If the steal guess is not in the listed responses, the original team keeps the round points.
- **Manual reveals** (clicking answers on the board) do not add to the round score.
- After 3 rounds, the team with the highest score wins!

## Question Set Format

Question banks now use a JSON format that can be imported from the setup screen:

```json
{
    "format": "family-feud-question-set",
    "version": 1,
    "title": "Your Question Set Name",
    "questions": [
        {
            "question": "Your question here",
            "answers": [
                { "text": "Answer 1", "points": 45 },
                { "text": "Answer 2", "points": 30 }
            ]
        }
    ]
}
```

Use [default-question-set.json](default-question-set.json) as the reference example. The game validates the `format`, `version`, question text, answer text, and point values when a file is imported.

When the app is served from a local web server, it auto-loads the bundled default set. If you open [index.html](index.html) directly from a `file:` URL, some browsers block that automatic JSON fetch, so import [default-question-set.json](default-question-set.json) manually from the setup screen.

## Files

- `index.html` - Main game interface
- `game.js` - Game logic and functionality
- `default-question-set.json` - Bundled sample question set in the import format
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