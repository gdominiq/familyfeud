// Game State
let gameState = {
    team1Name: '',
    team2Name: '',
    team1Score: 0,
    team2Score: 0,
    currentRound: 1,
    maxRounds: 3,
    roundScore: 0,
    wrongAnswers: 0,
    maxWrongAnswers: 3,
    questions: []
};

// Sample questions and answers - can be customized
const defaultQuestions = [
    {
        question: "Name something people do when they can't sleep",
        answers: [
            { text: "Watch TV", points: 38 },
            { text: "Read a book", points: 27 },
            { text: "Count sheep", points: 15 },
            { text: "Drink warm milk", points: 12 },
            { text: "Listen to music", points: 8 }
        ]
    },
    {
        question: "Name a popular pizza topping",
        answers: [
            { text: "Pepperoni", points: 45 },
            { text: "Mushrooms", points: 22 },
            { text: "Sausage", points: 15 },
            { text: "Onions", points: 10 },
            { text: "Bell peppers", points: 8 }
        ]
    },
    {
        question: "Name something you take on a camping trip",
        answers: [
            { text: "Tent", points: 50 },
            { text: "Sleeping bag", points: 25 },
            { text: "Flashlight", points: 12 },
            { text: "Food/snacks", points: 8 },
            { text: "Matches/lighter", points: 5 }
        ]
    }
];

// Sound Effects - using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Generate correct answer sound (ding)
function playCorrectSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Generate wrong answer sound (buzzer)
function playWrongSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 100;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
}

// Start the game
function startGame() {
    // Get team names
    gameState.team1Name = document.getElementById('team1-name').value.trim() || 'Team 1';
    gameState.team2Name = document.getElementById('team2-name').value.trim() || 'Team 2';
    
    // Initialize questions
    gameState.questions = defaultQuestions;
    
    // Update displays
    document.getElementById('team1-display').textContent = gameState.team1Name;
    document.getElementById('team2-display').textContent = gameState.team2Name;
    
    // Hide setup screen, show game screen
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Load first round
    loadRound();
}

// Load a round
function loadRound() {
    if (gameState.currentRound > gameState.maxRounds) {
        endGame();
        return;
    }
    
    // Reset round state
    gameState.roundScore = 0;
    gameState.wrongAnswers = 0;
    
    // Update displays
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('round-score').textContent = 0;
    
    // Reset X marks
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`x${i}`).classList.remove('active');
    }
    
    // Load question for current round
    const currentQuestion = gameState.questions[gameState.currentRound - 1];
    document.getElementById('question-text').textContent = currentQuestion.question;
    
    // Create answer board
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    
    currentQuestion.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-item';
        answerElement.dataset.number = index + 1;
        answerElement.dataset.index = index;
        answerElement.innerHTML = `
            <span class="answer-number">${index + 1}</span>
            <span class="answer-text">${answer.text}</span>
            <span class="answer-points">${answer.points}</span>
        `;
        answerElement.onclick = () => revealAnswer(index);
        answersContainer.appendChild(answerElement);
    });
    
    // Hide next round button
    document.getElementById('next-round-btn').style.display = 'none';
    document.getElementById('end-game-btn').style.display = 'none';
}

// Reveal an answer
function revealAnswer(index) {
    const currentQuestion = gameState.questions[gameState.currentRound - 1];
    const answerElements = document.querySelectorAll('.answer-item');
    const answerElement = answerElements[index];
    
    // Check if already revealed
    if (answerElement.classList.contains('revealed')) {
        return;
    }
    
    // Check if all answers revealed or 3 wrong answers
    const allRevealed = Array.from(answerElements).every(el => el.classList.contains('revealed'));
    if (allRevealed || gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        return;
    }
    
    // Reveal the answer
    answerElement.classList.add('revealed');
    const points = currentQuestion.answers[index].points;
    gameState.roundScore += points;
    
    // Play correct sound
    playCorrectSound();
    
    // Update round score display
    document.getElementById('round-score').textContent = gameState.roundScore;
    
    // Check if all answers are revealed
    const nowAllRevealed = Array.from(answerElements).every(el => el.classList.contains('revealed'));
    if (nowAllRevealed) {
        finishRound();
    }
}

// Handle wrong answer
function wrongAnswer() {
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        return;
    }
    
    gameState.wrongAnswers++;
    
    // Show X mark
    document.getElementById(`x${gameState.wrongAnswers}`).classList.add('active');
    
    // Play wrong sound
    playWrongSound();
    
    // Check if 3 strikes
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        finishRound();
    }
}

// Finish current round
function finishRound() {
    // Add round score to team score (alternating teams)
    if (gameState.currentRound % 2 === 1) {
        gameState.team1Score += gameState.roundScore;
        document.getElementById('team1-score').textContent = gameState.team1Score;
    } else {
        gameState.team2Score += gameState.roundScore;
        document.getElementById('team2-score').textContent = gameState.team2Score;
    }
    
    // Show next round or end game button
    if (gameState.currentRound < gameState.maxRounds) {
        document.getElementById('next-round-btn').style.display = 'inline-block';
    } else {
        document.getElementById('end-game-btn').style.display = 'inline-block';
    }
}

// Move to next round
function nextRound() {
    gameState.currentRound++;
    loadRound();
}

// End the game
function endGame() {
    // Update final scores
    document.getElementById('final-team1-name').textContent = gameState.team1Name;
    document.getElementById('final-team2-name').textContent = gameState.team2Name;
    document.getElementById('final-team1-score').textContent = gameState.team1Score;
    document.getElementById('final-team2-score').textContent = gameState.team2Score;
    
    // Determine winner
    let winnerText = '';
    if (gameState.team1Score > gameState.team2Score) {
        winnerText = `${gameState.team1Name} Wins! 🎉`;
    } else if (gameState.team2Score > gameState.team1Score) {
        winnerText = `${gameState.team2Name} Wins! 🎉`;
    } else {
        winnerText = "It's a Tie! 🤝";
    }
    document.getElementById('winner-text').textContent = winnerText;
    
    // Show game over screen
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('gameover-screen').style.display = 'block';
}

// Add keyboard support for wrong answers
document.addEventListener('keydown', (e) => {
    if (e.key === 'x' || e.key === 'X') {
        wrongAnswer();
    }
});

// Initialize audio context on first user interaction
document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });
