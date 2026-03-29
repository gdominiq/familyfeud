// Game State
let gameState = {
    team1Name: '',
    team2Name: '',
    team1Score: 0,
    team2Score: 0,
    currentRound: 1,
    maxRounds: 3,
    winningScore: 200,
    activeTeam: 1,
    roundScore: 0,
    wrongAnswers: 0,
    maxWrongAnswers: 3,
    roundOwningTeam: 1,
    lastRoundWinningTeam: null,
    faceoffActive: false,
    faceoffResponses: {},
    stealAttemptActive: false,
    stealTeam: null,
    questions: []
};

let strikeFeedbackTimeout = null;
let winCelebrationTimeout = null;
let loadedQuestionSet = null;
let currentQuestionSetSource = '';
let answerSubmissionInitialized = false;

const QUESTION_SET_FORMAT = 'family-feud-question-set';
const QUESTION_SET_VERSION = 1;
const DEFAULT_QUESTION_SET_PATH = 'default-question-set.json';

const synonymMap = {
    television: ['tv'],
    tv: ['television'],
    read: ['reading'],
    book: ['books'],
    count: ['counting'],
    sheep: ['sheeps'],
    warm: ['hot'],
    milk: ['dairy'],
    music: ['songs', 'song'],
    watch: ['watching'],
    pepperoni: ['pepperonis'],
    mushrooms: ['mushroom'],
    sausage: ['sausages'],
    onions: ['onion'],
    peppers: ['pepper', 'bell', 'capsicum'],
    bell: ['peppers', 'pepper'],
    tent: ['camping tent'],
    flashlight: ['torch', 'flash light'],
    food: ['snacks', 'snack'],
    matches: ['lighter', 'match'],
    lighter: ['matches', 'match']
};

function setStartButtonEnabled(isEnabled) {
    const startGameButton = document.getElementById('start-game-btn');
    if (startGameButton) {
        startGameButton.disabled = !isEnabled;
    }
}

function setQuestionSetStatus(message, isError = false) {
    const questionSetStatus = document.getElementById('question-set-status');
    if (!questionSetStatus) {
        return;
    }

    questionSetStatus.textContent = message;
    questionSetStatus.classList.toggle('error', isError);
}

function cloneQuestions(questions) {
    return questions.map((question) => ({
        question: question.question,
        answers: question.answers.map((answer) => ({
            text: answer.text,
            points: answer.points
        }))
    }));
}

function validateQuestionSet(questionSet) {
    if (!questionSet || typeof questionSet !== 'object' || Array.isArray(questionSet)) {
        throw new Error('Question set JSON must be an object.');
    }

    if (questionSet.format !== QUESTION_SET_FORMAT) {
        throw new Error(`Question set format must be "${QUESTION_SET_FORMAT}".`);
    }

    if (questionSet.version !== QUESTION_SET_VERSION) {
        throw new Error(`Question set version must be ${QUESTION_SET_VERSION}.`);
    }

    if (!Array.isArray(questionSet.questions) || questionSet.questions.length === 0) {
        throw new Error('Question set must include at least one question.');
    }

    const normalizedQuestions = questionSet.questions.map((questionEntry, questionIndex) => {
        if (!questionEntry || typeof questionEntry !== 'object' || Array.isArray(questionEntry)) {
            throw new Error(`Question ${questionIndex + 1} must be an object.`);
        }

        const questionText = typeof questionEntry.question === 'string' ? questionEntry.question.trim() : '';
        if (!questionText) {
            throw new Error(`Question ${questionIndex + 1} is missing text.`);
        }

        if (!Array.isArray(questionEntry.answers) || questionEntry.answers.length === 0) {
            throw new Error(`Question ${questionIndex + 1} must include at least one answer.`);
        }

        const answers = questionEntry.answers.map((answerEntry, answerIndex) => {
            if (!answerEntry || typeof answerEntry !== 'object' || Array.isArray(answerEntry)) {
                throw new Error(`Question ${questionIndex + 1}, answer ${answerIndex + 1} must be an object.`);
            }

            const answerText = typeof answerEntry.text === 'string' ? answerEntry.text.trim() : '';
            if (!answerText) {
                throw new Error(`Question ${questionIndex + 1}, answer ${answerIndex + 1} is missing text.`);
            }

            if (!Number.isFinite(answerEntry.points) || answerEntry.points < 0) {
                throw new Error(`Question ${questionIndex + 1}, answer ${answerIndex + 1} must have a valid points value.`);
            }

            return {
                text: answerText,
                points: answerEntry.points
            };
        });

        return {
            question: questionText,
            answers
        };
    });

    return {
        format: QUESTION_SET_FORMAT,
        version: QUESTION_SET_VERSION,
        title: typeof questionSet.title === 'string' && questionSet.title.trim()
            ? questionSet.title.trim()
            : 'Question Set',
        questions: normalizedQuestions
    };
}

function applyQuestionSet(questionSet, sourceLabel, sourceType = 'bundled') {
    if (sourceType === 'bundled' && currentQuestionSetSource === 'imported') {
        return;
    }

    loadedQuestionSet = questionSet;
    currentQuestionSetSource = sourceType;
    setStartButtonEnabled(true);
    setQuestionSetStatus(`Loaded ${questionSet.title} from ${sourceLabel} with ${questionSet.questions.length} questions.`);
}

async function loadBundledQuestionSet() {
    setStartButtonEnabled(false);

    try {
        const response = await fetch(DEFAULT_QUESTION_SET_PATH, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Bundled question set request failed with status ${response.status}.`);
        }

        const questionSet = validateQuestionSet(await response.json());
        applyQuestionSet(questionSet, 'the bundled default file');
    } catch (error) {
        if (currentQuestionSetSource === 'imported') {
            return;
        }

        loadedQuestionSet = null;
        currentQuestionSetSource = '';
        setStartButtonEnabled(false);

        if (window.location.protocol === 'file:') {
            setQuestionSetStatus('Bundled question set cannot auto-load from a file URL. Import default-question-set.json to continue.', true);
            return;
        }

        setQuestionSetStatus(`Could not load the bundled question set. ${error.message}`, true);
    }
}

async function importQuestionSet(file) {
    const questionSet = validateQuestionSet(JSON.parse(await file.text()));
    applyQuestionSet(questionSet, file.name, 'imported');
}

function setupQuestionSetImport() {
    const importButton = document.getElementById('import-question-set-btn');
    const fileInput = document.getElementById('question-set-file-input');

    if (!importButton || !fileInput) {
        return;
    }

    importButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }

        importButton.disabled = true;

        try {
            await importQuestionSet(file);
        } catch (error) {
            setStartButtonEnabled(Boolean(loadedQuestionSet));
            setQuestionSetStatus(`Import failed. ${error.message}`, true);
        } finally {
            fileInput.value = '';
            importButton.disabled = false;
        }
    });
}

// Sound Effects - using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const roundThemeAudio = new Audio('media/round_theme.m4a');
const applauseAudio = new Audio('media/applause.m4a');
roundThemeAudio.preload = 'auto';
roundThemeAudio.volume = 0.7;
applauseAudio.preload = 'auto';
applauseAudio.volume = 0.9;
let isThemeEnabled = true;
let triedApplauseFallback = false;

function playRoundTheme() {
    if (!isThemeEnabled) {
        return;
    }

    roundThemeAudio.currentTime = 0;
    const playPromise = roundThemeAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
    }
}

function stopRoundTheme() {
    roundThemeAudio.pause();
    roundThemeAudio.currentTime = 0;
}

function updateThemeToggleVisual() {
    const homeThemeToggle = document.getElementById('home-theme-toggle');
    const themePlayPauseButton = document.getElementById('theme-play-pause-btn');
    const themePlayPauseIcon = document.getElementById('theme-play-pause-icon');
    const themePlayPauseText = document.getElementById('theme-play-pause-text');
    const isPlaying = !roundThemeAudio.paused;

    if (!homeThemeToggle) {
        return;
    }

    homeThemeToggle.classList.toggle('playing', isPlaying);
    homeThemeToggle.title = isPlaying ? 'Stop theme song' : 'Play theme song';

    if (!themePlayPauseButton || !themePlayPauseIcon || !themePlayPauseText) {
        return;
    }

    themePlayPauseButton.classList.toggle('is-playing', isPlaying);
    themePlayPauseButton.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    themePlayPauseButton.setAttribute('aria-label', isPlaying ? 'Pause theme song' : 'Play theme song');
    themePlayPauseIcon.textContent = isPlaying ? '⏸' : '▶';
    themePlayPauseText.textContent = isPlaying ? 'Pause Theme' : 'Play Theme';
}

function toggleRoundThemeFromImage() {
    if (roundThemeAudio.paused) {
        isThemeEnabled = true;
        const playPromise = roundThemeAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    } else {
        isThemeEnabled = false;
        stopRoundTheme();
    }
}

function setupThemeToggleControl() {
    const homeThemeToggle = document.getElementById('home-theme-toggle');
    const themePlayPauseButton = document.getElementById('theme-play-pause-btn');

    if (!homeThemeToggle || !themePlayPauseButton) {
        return;
    }

    homeThemeToggle.addEventListener('click', toggleRoundThemeFromImage);
    homeThemeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleRoundThemeFromImage();
        }
    });

    themePlayPauseButton.addEventListener('click', () => {
        toggleRoundThemeFromImage();
    });

    roundThemeAudio.addEventListener('play', updateThemeToggleVisual);
    roundThemeAudio.addEventListener('pause', updateThemeToggleVisual);
    roundThemeAudio.addEventListener('ended', updateThemeToggleVisual);
    updateThemeToggleVisual();
}

function setupInstructionsToggle() {
    const instructionsToggleBtn = document.getElementById('instructions-toggle-btn');
    const instructionsPanel = document.getElementById('instructions-panel');

    if (!instructionsToggleBtn || !instructionsPanel) {
        return;
    }

    instructionsToggleBtn.addEventListener('click', () => {
        const isVisible = instructionsPanel.classList.toggle('visible');
        instructionsToggleBtn.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
    });
}

function playDingSound() {
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

function playApplauseSound() {
    applauseAudio.currentTime = 0;
    setTimeout(() => {
        const playPromise = applauseAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                if (!triedApplauseFallback) {
                    triedApplauseFallback = true;
                    applauseAudio.src = 'media/Applause.m4a';
                    applauseAudio.load();
                    const fallbackPlayPromise = applauseAudio.play();
                    if (fallbackPlayPromise && typeof fallbackPlayPromise.catch === 'function') {
                        fallbackPlayPromise.catch(() => {});
                    }
                }
            });
        }
    }, 520);
}

function playCorrectSound(shouldPlayApplause = true) {
    playDingSound();
    if (shouldPlayApplause) {
        playApplauseSound();
    }
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

function playWrongFeedback() {
    playWrongSound();
    showStrikeFeedback();
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function canonicalizeWord(word) {
    if (synonymMap[word]) {
        return word;
    }

    const canonicalEntry = Object.entries(synonymMap).find(([, synonyms]) => synonyms.includes(word));
    return canonicalEntry ? canonicalEntry[0] : word;
}

function normalizeForMatch(text) {
    return normalizeText(text)
        .split(' ')
        .filter(Boolean)
        .map((word) => canonicalizeWord(word))
        .join(' ');
}

function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[a.length][b.length];
}

function isSmartMatch(inputText, answerText) {
    const normalizedInput = normalizeForMatch(inputText);
    const normalizedAnswer = normalizeForMatch(answerText);

    if (!normalizedInput || !normalizedAnswer) {
        return false;
    }

    if (normalizedInput === normalizedAnswer) {
        return true;
    }

    if (normalizedAnswer.includes(normalizedInput) || normalizedInput.includes(normalizedAnswer)) {
        return true;
    }

    const inputWords = normalizedInput.split(' ');
    const answerWords = normalizedAnswer.split(' ');
    const sharedWords = inputWords.filter((word) => answerWords.includes(word));
    const overlapRatio = sharedWords.length / Math.max(inputWords.length, answerWords.length);
    if (overlapRatio >= 0.6) {
        return true;
    }

    return levenshteinDistance(normalizedInput, normalizedAnswer) <= 2;
}

function findMatchingAnswerIndex(guessText) {
    const currentQuestion = gameState.questions[gameState.currentRound - 1];
    const answerElements = document.querySelectorAll('.answer-item');

    for (let index = 0; index < currentQuestion.answers.length; index++) {
        const answerElement = answerElements[index];
        const isRevealed = answerElement.classList.contains('revealed');

        if (!isRevealed && isSmartMatch(guessText, currentQuestion.answers[index].text)) {
            return index;
        }
    }

    return -1;
}

function showStrikeFeedback() {
    const strikeFeedback = document.getElementById('strike-feedback');
    strikeFeedback.classList.add('active');

    if (strikeFeedbackTimeout) {
        clearTimeout(strikeFeedbackTimeout);
    }

    strikeFeedbackTimeout = setTimeout(() => {
        strikeFeedback.classList.remove('active');
    }, 850);
}

function updateStealIndicator() {
    const stealIndicator = document.getElementById('steal-indicator');
    if (!stealIndicator) {
        return;
    }

    if (gameState.faceoffActive) {
        const team1Responded = Boolean(gameState.faceoffResponses[1]);
        const team2Responded = Boolean(gameState.faceoffResponses[2]);

        if (!team1Responded && !team2Responded) {
            stealIndicator.textContent = 'Faceoff: both teams get one answer. Higher-ranked answer wins control.';
        } else if (team1Responded && !team2Responded) {
            stealIndicator.textContent = `${gameState.team2Name} now answers the faceoff.`;
        } else if (!team1Responded && team2Responded) {
            stealIndicator.textContent = `${gameState.team1Name} now answers the faceoff.`;
        } else {
            stealIndicator.textContent = 'Faceoff continues: both teams answer again.';
        }

        stealIndicator.classList.add('active');
        return;
    }

    if (gameState.stealAttemptActive && gameState.stealTeam) {
        const stealTeamName = gameState.stealTeam === 1 ? gameState.team1Name : gameState.team2Name;
        stealIndicator.textContent = `Steal Attempt: ${stealTeamName} has one guess.`;
        stealIndicator.classList.add('active');
        return;
    }

    stealIndicator.textContent = '';
    stealIndicator.classList.remove('active');
}

function clearWinningVisuals() {
    const team1Card = document.getElementById('team1-score-card');
    const team2Card = document.getElementById('team2-score-card');
    const gameOverBanner = document.getElementById('game-over-banner');

    if (team1Card) {
        team1Card.classList.remove('celebrating');
    }

    if (team2Card) {
        team2Card.classList.remove('celebrating');
    }

    if (gameOverBanner) {
        gameOverBanner.classList.remove('active');
    }

    if (winCelebrationTimeout) {
        clearTimeout(winCelebrationTimeout);
        winCelebrationTimeout = null;
    }
}

function triggerWinCelebration(winningTeam) {
    clearWinningVisuals();

    const team1Card = document.getElementById('team1-score-card');
    const team2Card = document.getElementById('team2-score-card');
    const gameOverBanner = document.getElementById('game-over-banner');
    const winningCard = winningTeam === 1 ? team1Card : team2Card;

    if (winningCard) {
        winningCard.classList.add('celebrating');
    }

    if (gameOverBanner) {
        gameOverBanner.classList.add('active');
    }

    winCelebrationTimeout = setTimeout(() => {
        endGame();
    }, 1800);
}

function clearTeamAnswerInputs() {
    document.getElementById('team1-answer-input').value = '';
    document.getElementById('team2-answer-input').value = '';
}

function resetFaceoffResponses() {
    gameState.faceoffResponses = {};
}

function resolveFaceoff(winningTeam) {
    gameState.faceoffActive = false;
    gameState.activeTeam = winningTeam;
    gameState.roundOwningTeam = winningTeam;
    updateStealIndicator();
    updateTeamInputState();

    const activeInput = document.getElementById(`team${winningTeam}-answer-input`);
    if (activeInput) {
        activeInput.focus();
    }
}

function getFaceoffWinningTeam() {
    const team1Response = gameState.faceoffResponses[1];
    const team2Response = gameState.faceoffResponses[2];

    if (team1Response && team2Response) {
        return team1Response.rank <= team2Response.rank ? 1 : 2;
    }

    if (team1Response && team1Response.correct) {
        return 1;
    }

    if (team2Response && team2Response.correct) {
        return 2;
    }

    return null;
}

function handleFaceoffAnswer(teamNumber, guessText, input) {
    const matchingIndex = findMatchingAnswerIndex(guessText);
    const isCorrect = matchingIndex >= 0;

    if (isCorrect) {
        revealAnswer(matchingIndex, false, true);
    } else {
        playWrongFeedback();
    }

    gameState.faceoffResponses[teamNumber] = {
        correct: isCorrect,
        rank: isCorrect ? matchingIndex + 1 : Number.POSITIVE_INFINITY
    };

    const opposingTeam = getOpposingTeam(teamNumber);
    const opposingResponse = gameState.faceoffResponses[opposingTeam];

    if (!opposingResponse) {
        if (matchingIndex === 0) {
            resolveFaceoff(teamNumber);
        } else {
            updateStealIndicator();
            updateTeamInputState();
            const opposingInput = document.getElementById(`team${opposingTeam}-answer-input`);
            if (opposingInput) {
                opposingInput.focus();
            }
        }

        input.value = '';
        return;
    }

    if (!isCorrect && !opposingResponse.correct) {
        resetFaceoffResponses();
        updateStealIndicator();
        updateTeamInputState();
        document.getElementById('team1-answer-input').focus();
        input.value = '';
        return;
    }

    const winningTeam = getFaceoffWinningTeam();
    resolveFaceoff(winningTeam);
    input.value = '';
}

function submitTeamAnswer(teamNumber) {
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers && !gameState.stealAttemptActive && !gameState.faceoffActive) {
        return;
    }

    if (!gameState.faceoffActive && teamNumber !== gameState.activeTeam) {
        return;
    }

    const input = document.getElementById(`team${teamNumber}-answer-input`);
    const guessText = input.value.trim();
    if (!guessText) {
        return;
    }

    if (gameState.faceoffActive) {
        if (gameState.faceoffResponses[teamNumber]) {
            return;
        }

        handleFaceoffAnswer(teamNumber, guessText, input);
        return;
    }

    if (gameState.stealAttemptActive) {
        const currentQuestion = gameState.questions[gameState.currentRound - 1];
        const matchingIndex = findMatchingAnswerIndex(guessText);
        const stealIsCorrect = currentQuestion.answers.some((answer) => isSmartMatch(guessText, answer.text));

        if (stealIsCorrect) {
            gameState.roundOwningTeam = teamNumber;

            if (matchingIndex >= 0) {
                const roundFinishedByReveal = revealAnswer(matchingIndex, false, true);
                if (roundFinishedByReveal) {
                    input.value = '';
                    return;
                }
            }
        } else {
            playWrongFeedback();
        }

        finishRound(gameState.roundOwningTeam);
        input.value = '';
        return;
    }

    const matchingIndex = findMatchingAnswerIndex(guessText);
    if (matchingIndex >= 0) {
        revealAnswer(matchingIndex, false);
    } else {
        wrongAnswer();
    }

    input.value = '';
    input.focus();
}

function setupAnswerSubmission() {
    if (answerSubmissionInitialized) {
        return;
    }

    document.getElementById('team1-submit-answer').onclick = () => submitTeamAnswer(1);
    document.getElementById('team2-submit-answer').onclick = () => submitTeamAnswer(2);

    document.getElementById('team1-answer-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitTeamAnswer(1);
        }
    });

    document.getElementById('team2-answer-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitTeamAnswer(2);
        }
    });

    answerSubmissionInitialized = true;
}

function updateTeamInputState() {
    const team1Input = document.getElementById('team1-answer-input');
    const team2Input = document.getElementById('team2-answer-input');
    const team1Button = document.getElementById('team1-submit-answer');
    const team2Button = document.getElementById('team2-submit-answer');
    const team1Label = document.getElementById('team1-answer-label');
    const team2Label = document.getElementById('team2-answer-label');

    if (gameState.faceoffActive) {
        const team1Responded = Boolean(gameState.faceoffResponses[1]);
        const team2Responded = Boolean(gameState.faceoffResponses[2]);

        team1Input.disabled = team1Responded;
        team1Button.disabled = team1Responded;
        team2Input.disabled = team2Responded;
        team2Button.disabled = team2Responded;

        team1Label.textContent = `${gameState.team1Name} Answer${team1Responded ? ' (Waiting)' : ' (Faceoff)'}`;
        team2Label.textContent = `${gameState.team2Name} Answer${team2Responded ? ' (Waiting)' : ' (Faceoff)'}`;
        return;
    }

    const isTeam1Active = gameState.activeTeam === 1;
    team1Input.disabled = !isTeam1Active;
    team1Button.disabled = !isTeam1Active;
    team2Input.disabled = isTeam1Active;
    team2Button.disabled = isTeam1Active;

    team1Label.textContent = `${gameState.team1Name} Answer${isTeam1Active ? ' (Active)' : ''}`;
    team2Label.textContent = `${gameState.team2Name} Answer${!isTeam1Active ? ' (Active)' : ''}`;
}

function clearWrongAnswerMarks() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`x${i}`).classList.remove('active');
    }
}

function getOpposingTeam(teamNumber) {
    return teamNumber === 1 ? 2 : 1;
}

function startStealAttempt() {
    if (gameState.stealAttemptActive) {
        return;
    }

    if (!gameState.roundOwningTeam) {
        gameState.roundOwningTeam = gameState.activeTeam;
    }

    gameState.stealAttemptActive = true;
    gameState.stealTeam = getOpposingTeam(gameState.roundOwningTeam);
    gameState.activeTeam = gameState.stealTeam;
    updateStealIndicator();
    updateTeamInputState();
}

// Start the game
function startGame() {
    if (!loadedQuestionSet) {
        setQuestionSetStatus('Load a question set before starting the game.', true);
        setStartButtonEnabled(false);
        return;
    }

    // Get team names
    gameState.team1Name = document.getElementById('team1-name').value.trim() || 'Team 1';
    gameState.team2Name = document.getElementById('team2-name').value.trim() || 'Team 2';
    gameState.team1Score = 0;
    gameState.team2Score = 0;
    gameState.currentRound = 1;
    gameState.activeTeam = 1;
    gameState.roundScore = 0;
    gameState.wrongAnswers = 0;
    gameState.roundOwningTeam = 1;
    gameState.lastRoundWinningTeam = null;
    gameState.faceoffActive = false;
    gameState.faceoffResponses = {};
    gameState.stealAttemptActive = false;
    gameState.stealTeam = null;
    
    // Initialize questions
    gameState.questions = cloneQuestions(loadedQuestionSet.questions);
    gameState.maxRounds = gameState.questions.length;
    
    // Update displays
    document.getElementById('team1-display').textContent = gameState.team1Name;
    document.getElementById('team2-display').textContent = gameState.team2Name;
    document.getElementById('team1-score').textContent = 0;
    document.getElementById('team2-score').textContent = 0;
    setupAnswerSubmission();
    
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
    gameState.activeTeam = gameState.lastRoundWinningTeam || 1;
    gameState.roundOwningTeam = gameState.currentRound === 1 ? null : gameState.activeTeam;
    gameState.roundScore = 0;
    gameState.wrongAnswers = 0;
    gameState.faceoffActive = gameState.currentRound === 1;
    resetFaceoffResponses();
    gameState.stealAttemptActive = false;
    gameState.stealTeam = null;
    clearWinningVisuals();
    
    // Update displays
    document.getElementById('current-round').textContent = gameState.currentRound;
    document.getElementById('round-score').textContent = 0;
    
    // Reset X marks
    clearWrongAnswerMarks();
    
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
        answerElement.onclick = () => revealAnswer(index, true);
        answersContainer.appendChild(answerElement);
    });
    
    // Hide next round button
    document.getElementById('next-round-btn').style.display = 'none';
    document.getElementById('end-game-btn').style.display = 'none';
    document.getElementById('strike-feedback').classList.remove('active');
    clearTeamAnswerInputs();
    updateStealIndicator();
    updateTeamInputState();

    // Play round theme
    playRoundTheme();
}

// Reveal an answer
function revealAnswer(index, isManualReveal = true, allowDuringSteal = false) {
    const currentQuestion = gameState.questions[gameState.currentRound - 1];
    const answerElements = document.querySelectorAll('.answer-item');
    const answerElement = answerElements[index];
    
    // Check if already revealed
    if (answerElement.classList.contains('revealed')) {
        return false;
    }
    
    // Check if 3 wrong answers
    if (!isManualReveal && (gameState.wrongAnswers >= gameState.maxWrongAnswers || gameState.stealAttemptActive) && !allowDuringSteal) {
        return false;
    }
    
    // Reveal the answer
    answerElement.classList.add('revealed');
    const points = currentQuestion.answers[index].points;
    if (!isManualReveal) {
        gameState.roundScore += points;
    }
    
    // Play correct sound
    playCorrectSound(!isManualReveal);
    
    // Update round score display
    document.getElementById('round-score').textContent = gameState.roundScore;
    
    // Check if all answers are revealed
    const nowAllRevealed = Array.from(answerElements).every(el => el.classList.contains('revealed'));
    if (nowAllRevealed) {
        const winningTeam = gameState.faceoffActive ? getFaceoffWinningTeam() : gameState.roundOwningTeam;
        if (gameState.faceoffActive && winningTeam) {
            gameState.faceoffActive = false;
            gameState.activeTeam = winningTeam;
            gameState.roundOwningTeam = winningTeam;
        }

        finishRound(winningTeam, !isManualReveal);
        return true;
    }

    return false;
}

// Handle wrong answer
function wrongAnswer() {
    if (gameState.faceoffActive || gameState.wrongAnswers >= gameState.maxWrongAnswers || gameState.stealAttemptActive) {
        return;
    }
    
    gameState.wrongAnswers++;
    
    // Show X mark
    document.getElementById(`x${gameState.wrongAnswers}`).classList.add('active');
    
    // Play wrong sound
    playWrongFeedback();
    
    // Check if 3 strikes
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        startStealAttempt();
    }
}

// Finish current round
function finishRound(winningTeam = gameState.roundOwningTeam, shouldAwardPoints = true) {
    gameState.activeTeam = winningTeam;
    gameState.roundOwningTeam = winningTeam;
    gameState.lastRoundWinningTeam = winningTeam;

    // Add round score to team score (alternating teams)
    if (shouldAwardPoints) {
        if (winningTeam === 1) {
            gameState.team1Score += gameState.roundScore;
            document.getElementById('team1-score').textContent = gameState.team1Score;
        } else {
            gameState.team2Score += gameState.roundScore;
            document.getElementById('team2-score').textContent = gameState.team2Score;
        }
    }

    gameState.stealAttemptActive = false;
    gameState.stealTeam = null;
    updateStealIndicator();
    updateTeamInputState();

    const team1ReachedTarget = gameState.team1Score >= gameState.winningScore;
    const team2ReachedTarget = gameState.team2Score >= gameState.winningScore;
    if (team1ReachedTarget || team2ReachedTarget) {
        const gameWinner = team1ReachedTarget ? 1 : 2;
        gameState.activeTeam = gameWinner;
        triggerWinCelebration(gameWinner);
        return;
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
    clearWinningVisuals();

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

setupThemeToggleControl();
setupInstructionsToggle();
setupQuestionSetImport();
loadBundledQuestionSet();
