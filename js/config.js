// Configuration and constants
const CONFIG = {
    // Predefined paragraph for typing test
    PARAGRAPH: `The quick brown fox jumps over the lazy dog, demonstrating agility and speed. In 2024, technology has advanced significantly, with AI systems processing 1,000+ requests per second. Programming requires precision: semicolons, brackets {}, and proper syntax are essential. "Practice makes perfect," as the saying goes. Numbers like 42, 3.14, and 100% accuracy matter in coding. Can you type this without seeing? It's challenging but rewarding!`,
    
    // Fixed timer duration in seconds (2 minutes)
    TIMER_DURATION: 120,
    
    // Performance thresholds
    PERFORMANCE: {
        EXCELLENT: { minAccuracy: 95, minNetWPM: 40 },
        GOOD: { minAccuracy: 85, minNetWPM: 25 },
        AVERAGE: { minAccuracy: 70, minNetWPM: 15 }
    }
};

// Global state
const STATE = {
    userName: '',
    rollNumber: '',
    testStarted: false,
    testEnded: false,
    startTime: null,
    timerInterval: null,
    typedText: '',
    referenceText: CONFIG.PARAGRAPH,
    currentScreen: 'landing-screen',
    testResults: null,
    timeRemaining: 0,
    timeElapsed: 0
};

// State persistence
const StateManager = {
    save() {
        const dataToSave = {
            userName: STATE.userName,
            rollNumber: STATE.rollNumber,
            testStarted: STATE.testStarted,
            testEnded: STATE.testEnded,
            typedText: STATE.typedText,
            currentScreen: STATE.currentScreen,
            testResults: STATE.testResults,
            timeRemaining: STATE.timeRemaining,
            timeElapsed: STATE.timeElapsed,
            startTime: STATE.startTime
        };
        localStorage.setItem('blindTypingState', JSON.stringify(dataToSave));
    },
    
    load() {
        const saved = localStorage.getItem('blindTypingState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(STATE, data);
                return true;
            } catch (e) {
                console.error('Failed to load state:', e);
                return false;
            }
        }
        return false;
    },
    
    clear() {
        localStorage.removeItem('blindTypingState');
    }
};
