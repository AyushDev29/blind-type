// Configuration and constants
const CONFIG = {
    // Predefined paragraph for typing test
    PARAGRAPH: `In today’s hyper-connected world, where notifications, deadlines, and expectations collide at lightning speed, the ability to type with precision under pressure has become a powerful advantage. At 6:45 a.m., while most people still struggle to wake up, disciplined individuals begin their routines, setting clear goals and tracking progress with focus and intent. “Consistency, not perfection, drives excellence,” is a principle often repeated, yet rarely practiced. During this blind typing challenge, every hesitation, misplaced comma, forgotten apostrophe, or incorrect number—such as 17, 42, or 3.141—can reduce overall accuracy. Maintain control, regulate your breathing, and trust your muscle memory. Don’t rush; instead, balance speed with clarity, structure with flow, and ambition with patience. When distractions rise and fatigue sets in, stay composed, adjust your rhythm, and continue forward, because true performance is revealed not in comfort, but in controlled chaos.`,
    
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
