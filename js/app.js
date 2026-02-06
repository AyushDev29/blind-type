// Main application logic
const App = {
    init() {
        this.setupScreenNavigation();
        this.setupDetailsForm();
        this.setupTestSetup();
        this.setupTest();
        this.setupResults();
        this.preventPageRefresh();
        this.restoreState();
    },
    
    restoreState() {
        const loaded = StateManager.load();
        if (!loaded) return;
        
        // Restore user details if present
        if (STATE.userName) {
            document.getElementById('full-name').value = STATE.userName;
            document.getElementById('full-name').disabled = true;
        }
        if (STATE.rollNumber) {
            document.getElementById('roll-number').value = STATE.rollNumber;
            document.getElementById('roll-number').disabled = true;
        }
        
        // Restore results if test was completed
        if (STATE.testEnded && STATE.testResults) {
            this.displayResults(STATE.testResults);
            return;
        }
        
        // Restore active test if it was in progress
        if (STATE.testStarted && !STATE.testEnded && STATE.typedText !== undefined) {
            this.showScreen('test-screen');
            document.getElementById('reference-text').textContent = CONFIG.PARAGRAPH;
            InputHandler.enable();
            
            // Restore typed text
            document.getElementById('typing-area').value = STATE.typedText;
            
            // Resume timer if there's time remaining
            if (STATE.timeRemaining > 0) {
                this.resumeTimer(STATE.timeRemaining);
            }
            
            this.updateTestDisplay();
            return;
        }
        
        // Otherwise show the appropriate screen
        if (STATE.currentScreen) {
            this.showScreen(STATE.currentScreen);
        }
    },
    
    resumeTimer(remainingSeconds) {
        const totalDuration = CONFIG.TIMER_DURATION;
        const elapsed = totalDuration - remainingSeconds;
        
        Timer.start(
            remainingSeconds,
            (remaining, newElapsed) => {
                STATE.timeRemaining = remaining;
                STATE.timeElapsed = elapsed + newElapsed;
                StateManager.save();
                
                document.getElementById('time-display').textContent = Timer.formatTime(remaining);
                
                const progress = (STATE.timeElapsed / totalDuration) * 100;
                document.getElementById('progress-fill').style.width = `${progress}%`;
            },
            () => {
                this.endTest();
            }
        );
    },
    
    setupScreenNavigation() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('details-screen');
        });
    },
    
    setupDetailsForm() {
        const form = document.getElementById('details-form');
        const nameInput = document.getElementById('full-name');
        const rollInput = document.getElementById('roll-number');
        const nameError = document.getElementById('name-error');
        const rollError = document.getElementById('roll-error');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous errors
            nameError.textContent = '';
            rollError.textContent = '';
            
            // Validate name
            const nameValidation = Validator.validateName(nameInput.value);
            if (!nameValidation.valid) {
                nameError.textContent = nameValidation.message;
                return;
            }
            
            // Validate roll number
            const rollValidation = Validator.validateRollNumber(rollInput.value);
            if (!rollValidation.valid) {
                rollError.textContent = rollValidation.message;
                return;
            }
            
            // Store validated data
            STATE.userName = nameValidation.value;
            STATE.rollNumber = rollValidation.value;
            
            // Disable inputs to prevent editing
            nameInput.disabled = true;
            rollInput.disabled = true;
            
            // Save state
            StateManager.save();
            
            // Show setup screen
            this.showScreen('setup-screen');
            this.loadParagraphPreview();
        });
    },
    
    setupTestSetup() {
        // Load paragraph preview
        this.loadParagraphPreview();
        
        // Begin test button
        document.getElementById('begin-test-btn').addEventListener('click', () => {
            this.startTest();
        });
    },
    
    loadParagraphPreview() {
        // Load custom paragraph if set by admin
        const customParagraph = localStorage.getItem('testParagraph');
        const paragraph = customParagraph || CONFIG.PARAGRAPH;
        document.getElementById('preview-paragraph').textContent = paragraph;
        CONFIG.PARAGRAPH = paragraph;
    },
    
    setupTest() {
        const typingArea = document.getElementById('typing-area');
        InputHandler.init(typingArea);
        
        let firstKeyPressed = false;
        
        typingArea.addEventListener('input', () => {
            if (!STATE.testStarted) return;
            
            // Start timer on first keystroke
            if (!firstKeyPressed) {
                firstKeyPressed = true;
                this.startTimer();
            }
            
            // Update character count and accuracy
            STATE.typedText = InputHandler.getValue();
            this.updateTestDisplay();
            StateManager.save();
        });
    },
    
    startTest() {
        this.showScreen('test-screen');
        
        // Load custom paragraph if set by admin
        const customParagraph = localStorage.getItem('testParagraph');
        const paragraph = customParagraph || CONFIG.PARAGRAPH;
        CONFIG.PARAGRAPH = paragraph;
        
        // Load reference text
        document.getElementById('reference-text').textContent = CONFIG.PARAGRAPH;
        
        // Reset state
        STATE.testStarted = true;
        STATE.testEnded = false;
        STATE.typedText = '';
        
        // Enable typing area
        InputHandler.enable();
        
        // Initialize display with fixed 2 minute timer
        document.getElementById('char-count').textContent = '0';
        document.getElementById('time-display').textContent = Timer.formatTime(CONFIG.TIMER_DURATION);
        document.getElementById('accuracy-display').textContent = '100%';
        document.getElementById('progress-fill').style.width = '0%';
    },
    
    startTimer() {
        Timer.start(
            CONFIG.TIMER_DURATION,
            (remaining, elapsed) => {
                STATE.timeRemaining = remaining;
                STATE.timeElapsed = elapsed;
                
                // Update time display
                document.getElementById('time-display').textContent = Timer.formatTime(remaining);
                
                // Update progress bar
                const progress = (elapsed / CONFIG.TIMER_DURATION) * 100;
                document.getElementById('progress-fill').style.width = `${progress}%`;
                
                // Save state periodically (every second)
                if (elapsed % 1 === 0) {
                    StateManager.save();
                }
            },
            () => {
                // Timer completed
                this.endTest();
            }
        );
    },
    
    updateTestDisplay() {
        const charCount = STATE.typedText.length;
        document.getElementById('char-count').textContent = charCount;
        
        // Calculate and display live accuracy
        const accuracyData = Scoring.calculateAccuracy(STATE.typedText, CONFIG.PARAGRAPH);
        document.getElementById('accuracy-display').textContent = `${accuracyData.accuracy.toFixed(1)}%`;
    },
    
    endTest() {
        if (STATE.testEnded) return;
        
        STATE.testEnded = true;
        STATE.testStarted = false;
        
        // Stop timer
        Timer.stop();
        
        // Disable typing
        InputHandler.disable();
        
        // Calculate results
        const minutes = STATE.timeElapsed > 0 ? STATE.timeElapsed / 60 : Timer.getElapsedMinutes();
        const results = Scoring.generateResults(STATE.typedText, CONFIG.PARAGRAPH, minutes);
        
        // Store results
        STATE.testResults = results;
        StateManager.save();
        
        // Save score to admin panel
        this.saveScoreToAdmin(results);
        
        // Show results
        this.displayResults(results);
    },
    
    saveScoreToAdmin(results) {
        const scoreData = {
            userName: STATE.userName,
            rollNumber: STATE.rollNumber,
            totalTyped: results.totalTyped,
            correct: results.correct,
            incorrect: results.incorrect,
            accuracy: results.accuracy,
            grossWPM: results.grossWPM,
            netWPM: results.netWPM,
            accuracyPoints: results.accuracyPoints,
            speedPoints: results.speedPoints,
            totalPoints: results.totalPoints,
            performance: results.performance,
            typedText: STATE.typedText,
            referenceText: CONFIG.PARAGRAPH,
            timestamp: new Date().toISOString()
        };
        
        // Load existing scores
        const saved = localStorage.getItem('userScores');
        const scores = saved ? JSON.parse(saved) : [];
        
        // Add new score
        scores.push(scoreData);
        
        // Save back to localStorage
        localStorage.setItem('userScores', JSON.stringify(scores));
    },
    
    displayResults(results) {
        // User info
        document.getElementById('result-name').textContent = STATE.userName;
        document.getElementById('result-roll').textContent = `Roll No: ${STATE.rollNumber}`;
        
        // Time duration - fixed at 2 minutes
        document.getElementById('result-time').textContent = '2 Minutes';
        
        // Statistics
        document.getElementById('result-total-chars').textContent = results.totalTyped;
        document.getElementById('result-correct').textContent = results.correct;
        document.getElementById('result-incorrect').textContent = results.incorrect;
        document.getElementById('result-accuracy').textContent = `${results.accuracy.toFixed(2)}%`;
        document.getElementById('result-gross-wpm').textContent = results.grossWPM.toFixed(2);
        document.getElementById('result-net-wpm').textContent = results.netWPM.toFixed(2);
        document.getElementById('result-performance').textContent = results.performance;
        
        // Points breakdown
        document.getElementById('result-accuracy-points').textContent = results.accuracyPoints;
        document.getElementById('result-speed-points').textContent = results.speedPoints;
        document.getElementById('result-total-points').textContent = results.totalPoints;
        
        // Display typed text with highlighting
        this.displayTypedText(STATE.typedText, CONFIG.PARAGRAPH);
        
        // Show results screen
        this.showScreen('results-screen');
    },
    
    displayTypedText(typedText, referenceText) {
        const displayElement = document.getElementById('typed-text-display');
        
        if (typedText.length === 0) {
            displayElement.innerHTML = '<em style="color: #999;">No text was typed</em>';
            return;
        }
        
        let html = '';
        
        // Compare character by character
        for (let i = 0; i < typedText.length; i++) {
            const typedChar = typedText[i];
            const refChar = i < referenceText.length ? referenceText[i] : null;
            
            if (refChar === null) {
                // Extra characters beyond reference text
                html += `<span class="char-extra">${this.escapeHtml(typedChar)}</span>`;
            } else if (typedChar === refChar) {
                // Correct character
                html += `<span class="char-correct">${this.escapeHtml(typedChar)}</span>`;
            } else {
                // Incorrect character
                html += `<span class="char-incorrect">${this.escapeHtml(typedChar)}</span>`;
            }
        }
        
        displayElement.innerHTML = html;
    },
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            ' ': '&nbsp;'
        };
        return text.replace(/[&<>"' ]/g, m => map[m]);
    },
    
    setupResults() {
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.resetTest();
            this.showScreen('setup-screen');
        });
        
        document.getElementById('exit-btn').addEventListener('click', () => {
            this.resetAll();
            this.showScreen('landing-screen');
        });
    },
    
    resetTest() {
        STATE.testStarted = false;
        STATE.testEnded = false;
        STATE.typedText = '';
        STATE.testResults = null;
        STATE.timeRemaining = 0;
        STATE.timeElapsed = 0;
        Timer.stop();
        InputHandler.clear();
        StateManager.save();
    },
    
    resetAll() {
        this.resetTest();
        
        // Re-enable name and roll inputs
        document.getElementById('full-name').disabled = false;
        document.getElementById('roll-number').disabled = false;
        document.getElementById('full-name').value = '';
        document.getElementById('roll-number').value = '';
        
        STATE.userName = '';
        STATE.rollNumber = '';
        STATE.currentScreen = 'landing-screen';
        
        // Clear saved state
        StateManager.clear();
    },
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        STATE.currentScreen = screenId;
        StateManager.save();
    },
    
    preventPageRefresh() {
        window.addEventListener('beforeunload', (e) => {
            if (STATE.testStarted && !STATE.testEnded) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
        
        // Tab visibility warning
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && STATE.testStarted && !STATE.testEnded) {
                if (confirm('You switched tabs during the test. Do you want to submit your current progress?')) {
                    this.endTest();
                }
            }
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
