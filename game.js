// Game State
let gameState = {
    team1Name: '',
    team2Name: '',
    team1Score: 0,
    team2Score: 0,
    currentRound: 1,
    maxRounds: 3,
    activeTeam: 1,
    roundScore: 0,
    wrongAnswers: 0,
    maxWrongAnswers: 3,
    questions: []
};

let strikeFeedbackTimeout = null;

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

// Sample questions and answers - can be customized
const defaultQuestions = [
    {
        question: "Name something people do when they cannot sleep",
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
            { text: "Food", points: 8 },
            { text: "Matches", points: 5 }
        ]
    },
    {
        question: "Name a breakfast food",
        answers: [
            { text: "Eggs", points: 34 },
            { text: "Cereal", points: 25 },
            { text: "Toast", points: 18 },
            { text: "Pancakes", points: 13 },
            { text: "Bacon", points: 10 }
        ]
    },
    {
        question: "Name something people forget at home",
        answers: [
            { text: "Phone", points: 36 },
            { text: "Keys", points: 28 },
            { text: "Wallet", points: 20 },
            { text: "Lunch", points: 9 },
            { text: "Glasses", points: 7 }
        ]
    },
    {
        question: "Name a reason people are late to work",
        answers: [
            { text: "Traffic", points: 41 },
            { text: "Overslept", points: 27 },
            { text: "Weather", points: 13 },
            { text: "Car trouble", points: 11 },
            { text: "Lost track of time", points: 8 }
        ]
    },
    {
        question: "Name something you put in coffee",
        answers: [
            { text: "Sugar", points: 33 },
            { text: "Cream", points: 30 },
            { text: "Milk", points: 22 },
            { text: "Sweetener", points: 8 },
            { text: "Ice", points: 7 }
        ]
    },
    {
        question: "Name a place kids do not want to go",
        answers: [
            { text: "School", points: 58 },
            { text: "Doctor", points: 18 },
            { text: "Dentist", points: 12 },
            { text: "Bed", points: 7 },
            { text: "Grocery store", points: 5 }
        ]
    },
    {
        question: "Name something found in a toolbox",
        answers: [
            { text: "Hammer", points: 30 },
            { text: "Screwdriver", points: 28 },
            { text: "Wrench", points: 20 },
            { text: "Tape measure", points: 12 },
            { text: "Pliers", points: 10 }
        ]
    },
    {
        question: "Name something people do at the gym",
        answers: [
            { text: "Run", points: 32 },
            { text: "Lift weights", points: 27 },
            { text: "Stretch", points: 17 },
            { text: "Bike", points: 14 },
            { text: "Take class", points: 10 }
        ]
    },
    {
        question: "Name a fruit people commonly juice",
        answers: [
            { text: "Orange", points: 47 },
            { text: "Apple", points: 20 },
            { text: "Lemon", points: 14 },
            { text: "Grapefruit", points: 11 },
            { text: "Carrot", points: 8 }
        ]
    },
    {
        question: "Name something people do before bed",
        answers: [
            { text: "Brush teeth", points: 35 },
            { text: "Set alarm", points: 24 },
            { text: "Shower", points: 17 },
            { text: "Read", points: 14 },
            { text: "Check phone", points: 10 }
        ]
    },
    {
        question: "Name a school supply",
        answers: [
            { text: "Pencil", points: 30 },
            { text: "Notebook", points: 27 },
            { text: "Backpack", points: 19 },
            { text: "Eraser", points: 13 },
            { text: "Calculator", points: 11 }
        ]
    },
    {
        question: "Name something people grill",
        answers: [
            { text: "Burgers", points: 33 },
            { text: "Hot dogs", points: 26 },
            { text: "Steak", points: 19 },
            { text: "Chicken", points: 12 },
            { text: "Vegetables", points: 10 }
        ]
    },
    {
        question: "Name something in a movie theater",
        answers: [
            { text: "Screen", points: 29 },
            { text: "Popcorn", points: 27 },
            { text: "Seats", points: 19 },
            { text: "Tickets", points: 14 },
            { text: "Projector", points: 11 }
        ]
    },
    {
        question: "Name a thing people do on vacation",
        answers: [
            { text: "Relax", points: 30 },
            { text: "Swim", points: 22 },
            { text: "Sightsee", points: 20 },
            { text: "Take photos", points: 16 },
            { text: "Shop", points: 12 }
        ]
    },
    {
        question: "Name something that is hard to open",
        answers: [
            { text: "Jar", points: 40 },
            { text: "Pickle lid", points: 23 },
            { text: "Package", points: 17 },
            { text: "Bottle cap", points: 11 },
            { text: "Safe", points: 9 }
        ]
    },
    {
        question: "Name something in a wallet",
        answers: [
            { text: "Cash", points: 30 },
            { text: "Credit card", points: 27 },
            { text: "ID", points: 21 },
            { text: "Receipts", points: 12 },
            { text: "Photos", points: 10 }
        ]
    },
    {
        question: "Name a reason to call 911",
        answers: [
            { text: "Fire", points: 29 },
            { text: "Medical emergency", points: 28 },
            { text: "Car accident", points: 21 },
            { text: "Break in", points: 12 },
            { text: "Crime", points: 10 }
        ]
    },
    {
        question: "Name something people borrow",
        answers: [
            { text: "Money", points: 35 },
            { text: "Car", points: 24 },
            { text: "Book", points: 18 },
            { text: "Pen", points: 13 },
            { text: "Phone charger", points: 10 }
        ]
    },
    {
        question: "Name something you wear in winter",
        answers: [
            { text: "Coat", points: 34 },
            { text: "Hat", points: 22 },
            { text: "Gloves", points: 20 },
            { text: "Scarf", points: 14 },
            { text: "Boots", points: 10 }
        ]
    },
    {
        question: "Name a board game",
        answers: [
            { text: "Monopoly", points: 31 },
            { text: "Chess", points: 25 },
            { text: "Checkers", points: 19 },
            { text: "Scrabble", points: 14 },
            { text: "Clue", points: 11 }
        ]
    },
    {
        question: "Name something people recycle",
        answers: [
            { text: "Plastic", points: 30 },
            { text: "Paper", points: 26 },
            { text: "Glass", points: 20 },
            { text: "Cardboard", points: 14 },
            { text: "Cans", points: 10 }
        ]
    },
    {
        question: "Name something found in a bathroom",
        answers: [
            { text: "Toothbrush", points: 32 },
            { text: "Soap", points: 28 },
            { text: "Towel", points: 18 },
            { text: "Toilet paper", points: 12 },
            { text: "Shampoo", points: 10 }
        ]
    },
    {
        question: "Name a reason people move to a new city",
        answers: [
            { text: "Job", points: 36 },
            { text: "Family", points: 24 },
            { text: "School", points: 18 },
            { text: "Cheaper housing", points: 12 },
            { text: "Better weather", points: 10 }
        ]
    },
    {
        question: "Name something people lose often",
        answers: [
            { text: "Keys", points: 34 },
            { text: "Phone", points: 29 },
            { text: "Remote", points: 17 },
            { text: "Socks", points: 11 },
            { text: "Pens", points: 9 }
        ]
    },
    {
        question: "Name a pet that lives in a cage",
        answers: [
            { text: "Hamster", points: 31 },
            { text: "Bird", points: 29 },
            { text: "Rabbit", points: 19 },
            { text: "Guinea pig", points: 12 },
            { text: "Ferret", points: 9 }
        ]
    },
    {
        question: "Name something people do at a wedding",
        answers: [
            { text: "Dance", points: 30 },
            { text: "Eat", points: 25 },
            { text: "Take photos", points: 20 },
            { text: "Toast", points: 14 },
            { text: "Cry", points: 11 }
        ]
    },
    {
        question: "Name something that can be sticky",
        answers: [
            { text: "Honey", points: 33 },
            { text: "Glue", points: 26 },
            { text: "Syrup", points: 19 },
            { text: "Candy", points: 12 },
            { text: "Tape", points: 10 }
        ]
    },
    {
        question: "Name something with wheels",
        answers: [
            { text: "Car", points: 36 },
            { text: "Bike", points: 24 },
            { text: "Skateboard", points: 17 },
            { text: "Bus", points: 13 },
            { text: "Stroller", points: 10 }
        ]
    },
    {
        question: "Name a room in a house",
        answers: [
            { text: "Kitchen", points: 31 },
            { text: "Bedroom", points: 27 },
            { text: "Bathroom", points: 21 },
            { text: "Living room", points: 12 },
            { text: "Dining room", points: 9 }
        ]
    },
    {
        question: "Name a reason people call in sick",
        answers: [
            { text: "Flu", points: 33 },
            { text: "Fever", points: 26 },
            { text: "Headache", points: 18 },
            { text: "Stomachache", points: 14 },
            { text: "Cold", points: 9 }
        ]
    },
    {
        question: "Name something you put on a sandwich",
        answers: [
            { text: "Turkey", points: 28 },
            { text: "Cheese", points: 27 },
            { text: "Lettuce", points: 20 },
            { text: "Tomato", points: 14 },
            { text: "Mayonnaise", points: 11 }
        ]
    },
    {
        question: "Name a reason people go to the mall",
        answers: [
            { text: "Shopping", points: 44 },
            { text: "Food court", points: 20 },
            { text: "Movie", points: 16 },
            { text: "Walk around", points: 11 },
            { text: "Meet friends", points: 9 }
        ]
    },
    {
        question: "Name something people keep in a garage",
        answers: [
            { text: "Car", points: 41 },
            { text: "Tools", points: 24 },
            { text: "Bike", points: 15 },
            { text: "Lawn mower", points: 11 },
            { text: "Boxes", points: 9 }
        ]
    },
    {
        question: "Name a profession that wears a uniform",
        answers: [
            { text: "Police officer", points: 30 },
            { text: "Nurse", points: 25 },
            { text: "Firefighter", points: 21 },
            { text: "Chef", points: 13 },
            { text: "Pilot", points: 11 }
        ]
    },
    {
        question: "Name something people do on their phone",
        answers: [
            { text: "Text", points: 34 },
            { text: "Call", points: 26 },
            { text: "Social media", points: 20 },
            { text: "Play games", points: 12 },
            { text: "Watch videos", points: 8 }
        ]
    },
    {
        question: "Name a common New Year resolution",
        answers: [
            { text: "Exercise", points: 36 },
            { text: "Lose weight", points: 27 },
            { text: "Save money", points: 17 },
            { text: "Eat healthy", points: 12 },
            { text: "Quit smoking", points: 8 }
        ]
    },
    {
        question: "Name something people do at a park",
        answers: [
            { text: "Walk", points: 31 },
            { text: "Picnic", points: 23 },
            { text: "Play sports", points: 20 },
            { text: "Run", points: 14 },
            { text: "Read", points: 12 }
        ]
    },
    {
        question: "Name something found on a desk",
        answers: [
            { text: "Computer", points: 33 },
            { text: "Pen", points: 25 },
            { text: "Notebook", points: 19 },
            { text: "Phone", points: 14 },
            { text: "Lamp", points: 9 }
        ]
    },
    {
        question: "Name a reason people go to the doctor",
        answers: [
            { text: "Checkup", points: 29 },
            { text: "Sick", points: 28 },
            { text: "Injury", points: 19 },
            { text: "Pain", points: 14 },
            { text: "Prescription", points: 10 }
        ]
    },
    {
        question: "Name something you might do in the rain",
        answers: [
            { text: "Use umbrella", points: 35 },
            { text: "Wear a raincoat", points: 24 },
            { text: "Run inside", points: 18 },
            { text: "Drive carefully", points: 13 },
            { text: "Jump in puddles", points: 10 }
        ]
    },
    {
        question: "Name a chore people avoid",
        answers: [
            { text: "Cleaning bathroom", points: 33 },
            { text: "Doing dishes", points: 24 },
            { text: "Laundry", points: 18 },
            { text: "Vacuuming", points: 14 },
            { text: "Taking out trash", points: 11 }
        ]
    },
    {
        question: "Name a snack people eat at night",
        answers: [
            { text: "Chips", points: 31 },
            { text: "Ice cream", points: 26 },
            { text: "Popcorn", points: 20 },
            { text: "Cookies", points: 14 },
            { text: "Fruit", points: 9 }
        ]
    },
    {
        question: "Name something people do before a trip",
        answers: [
            { text: "Pack", points: 39 },
            { text: "Book hotel", points: 21 },
            { text: "Plan itinerary", points: 18 },
            { text: "Charge phone", points: 12 },
            { text: "Check weather", points: 10 }
        ]
    },
    {
        question: "Name something people buy at a pharmacy",
        answers: [
            { text: "Medicine", points: 35 },
            { text: "Vitamins", points: 22 },
            { text: "Bandages", points: 18 },
            { text: "Toothpaste", points: 14 },
            { text: "Shampoo", points: 11 }
        ]
    },
    {
        question: "Name something people do at a birthday party",
        answers: [
            { text: "Eat cake", points: 32 },
            { text: "Sing", points: 26 },
            { text: "Open gifts", points: 20 },
            { text: "Play games", points: 13 },
            { text: "Take photos", points: 9 }
        ]
    },
    {
        question: "Name something people put in a backpack",
        answers: [
            { text: "Books", points: 31 },
            { text: "Laptop", points: 24 },
            { text: "Water bottle", points: 20 },
            { text: "Lunch", points: 14 },
            { text: "Headphones", points: 11 }
        ]
    },
    {
        question: "Name something people do to save money",
        answers: [
            { text: "Cook at home", points: 30 },
            { text: "Use coupons", points: 24 },
            { text: "Budget", points: 21 },
            { text: "Buy on sale", points: 15 },
            { text: "Cancel subscriptions", points: 10 }
        ]
    },
    {
        question: "Name something people clean every day",
        answers: [
            { text: "Dishes", points: 35 },
            { text: "Kitchen counter", points: 22 },
            { text: "Table", points: 18 },
            { text: "Sink", points: 14 },
            { text: "Floor", points: 11 }
        ]
    },
    {
        question: "Name a place where people wait in line",
        answers: [
            { text: "Grocery store", points: 30 },
            { text: "Bank", points: 24 },
            { text: "Airport", points: 21 },
            { text: "Coffee shop", points: 14 },
            { text: "DMV", points: 11 }
        ]
    },
    {
        question: "Name something people do after work",
        answers: [
            { text: "Watch TV", points: 32 },
            { text: "Eat dinner", points: 25 },
            { text: "Exercise", points: 18 },
            { text: "Relax", points: 14 },
            { text: "Nap", points: 11 }
        ]
    },
    {
        question: "Name something people do at the beach",
        answers: [
            { text: "Swim", points: 31 },
            { text: "Sunbathe", points: 24 },
            { text: "Build sandcastle", points: 19 },
            { text: "Play volleyball", points: 14 },
            { text: "Surf", points: 12 }
        ]
    },
    {
        question: "Name something that wakes people up",
        answers: [
            { text: "Alarm clock", points: 42 },
            { text: "Phone alarm", points: 24 },
            { text: "Sunlight", points: 15 },
            { text: "Noise", points: 11 },
            { text: "Coffee", points: 8 }
        ]
    },
    {
        question: "Name something people do while watching TV",
        answers: [
            { text: "Eat snacks", points: 34 },
            { text: "Use phone", points: 25 },
            { text: "Talk", points: 18 },
            { text: "Change channels", points: 13 },
            { text: "Fall asleep", points: 10 }
        ]
    },
    {
        question: "Name something people bring to a picnic",
        answers: [
            { text: "Food", points: 35 },
            { text: "Blanket", points: 23 },
            { text: "Drinks", points: 20 },
            { text: "Plates", points: 12 },
            { text: "Basket", points: 10 }
        ]
    },
    {
        question: "Name a reason people miss a flight",
        answers: [
            { text: "Late to airport", points: 40 },
            { text: "Traffic", points: 23 },
            { text: "Overslept", points: 16 },
            { text: "Wrong gate", points: 12 },
            { text: "Security line", points: 9 }
        ]
    },
    {
        question: "Name something people do on a road trip",
        answers: [
            { text: "Listen to music", points: 31 },
            { text: "Eat snacks", points: 24 },
            { text: "Take turns driving", points: 19 },
            { text: "Stop for gas", points: 14 },
            { text: "Play games", points: 12 }
        ]
    },
    {
        question: "Name something people order at a coffee shop",
        answers: [
            { text: "Latte", points: 30 },
            { text: "Black coffee", points: 25 },
            { text: "Cappuccino", points: 19 },
            { text: "Tea", points: 15 },
            { text: "Muffin", points: 11 }
        ]
    }
];

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
    if (!homeThemeToggle) {
        return;
    }

    homeThemeToggle.classList.toggle('playing', !roundThemeAudio.paused);
    homeThemeToggle.title = roundThemeAudio.paused ? 'Play theme song' : 'Stop theme song';
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
    if (!homeThemeToggle) {
        return;
    }

    homeThemeToggle.addEventListener('click', toggleRoundThemeFromImage);
    homeThemeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleRoundThemeFromImage();
        }
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

function clearTeamAnswerInputs() {
    document.getElementById('team1-answer-input').value = '';
    document.getElementById('team2-answer-input').value = '';
}

function submitTeamAnswer(teamNumber) {
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        return;
    }

    const input = document.getElementById(`team${teamNumber}-answer-input`);
    const guessText = input.value.trim();
    if (!guessText) {
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
}

function updateTeamInputState() {
    const team1Input = document.getElementById('team1-answer-input');
    const team2Input = document.getElementById('team2-answer-input');
    const team1Button = document.getElementById('team1-submit-answer');
    const team2Button = document.getElementById('team2-submit-answer');
    const team1Label = document.getElementById('team1-answer-label');
    const team2Label = document.getElementById('team2-answer-label');

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

function switchToAlternateTeam() {
    gameState.activeTeam = gameState.activeTeam === 1 ? 2 : 1;
    gameState.wrongAnswers = 0;
    clearWrongAnswerMarks();
    updateTeamInputState();
}

// Start the game
function startGame() {
    // Get team names
    gameState.team1Name = document.getElementById('team1-name').value.trim() || 'Team 1';
    gameState.team2Name = document.getElementById('team2-name').value.trim() || 'Team 2';
    
    // Initialize questions
    gameState.questions = defaultQuestions;
    gameState.maxRounds = gameState.questions.length;
    
    // Update displays
    document.getElementById('team1-display').textContent = gameState.team1Name;
    document.getElementById('team2-display').textContent = gameState.team2Name;
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
    gameState.activeTeam = gameState.currentRound % 2 === 1 ? 1 : 2;
    gameState.roundScore = 0;
    gameState.wrongAnswers = 0;
    
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
    updateTeamInputState();

    // Play round theme
    playRoundTheme();
}

// Reveal an answer
function revealAnswer(index, isManualReveal = true) {
    const currentQuestion = gameState.questions[gameState.currentRound - 1];
    const answerElements = document.querySelectorAll('.answer-item');
    const answerElement = answerElements[index];
    
    // Check if already revealed
    if (answerElement.classList.contains('revealed')) {
        return;
    }
    
    // Check if 3 wrong answers
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        return;
    }
    
    // Reveal the answer
    answerElement.classList.add('revealed');
    const points = currentQuestion.answers[index].points;
    gameState.roundScore += points;
    
    // Play correct sound
    playCorrectSound(!isManualReveal);
    
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
    showStrikeFeedback();
    
    // Check if 3 strikes
    if (gameState.wrongAnswers >= gameState.maxWrongAnswers) {
        switchToAlternateTeam();
    }
}

// Finish current round
function finishRound() {
    // Add round score to team score (alternating teams)
    if (gameState.activeTeam === 1) {
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

setupThemeToggleControl();
setupInstructionsToggle();
