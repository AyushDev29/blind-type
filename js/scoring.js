// Scoring and accuracy calculation
const Scoring = {
    calculateAccuracy(typedText, referenceText) {
        if (typedText.length === 0) {
            return {
                totalTyped: 0,
                correct: 0,
                incorrect: 0,
                accuracy: 0
            };
        }
        
        let correct = 0;
        let incorrect = 0;
        const totalTyped = typedText.length;
        
        // Compare character by character
        for (let i = 0; i < typedText.length; i++) {
            if (i < referenceText.length && typedText[i] === referenceText[i]) {
                correct++;
            } else {
                incorrect++;
            }
        }
        
        const accuracy = totalTyped > 0 ? (correct / totalTyped) * 100 : 0;
        
        return {
            totalTyped,
            correct,
            incorrect,
            accuracy: Math.round(accuracy * 100) / 100
        };
    },
    
    calculateWPM(totalTyped, correct, incorrect, minutes) {
        if (minutes <= 0) {
            return { grossWPM: 0, netWPM: 0 };
        }
        
        // Gross WPM = (total characters typed / 5) / minutes
        const grossWPM = (totalTyped / 5) / minutes;
        
        // Net WPM = ((correct - incorrect) / 5) / minutes
        let netWPM = ((correct - incorrect) / 5) / minutes;
        
        // Prevent negative WPM
        if (netWPM < 0 || incorrect > correct) {
            netWPM = 0;
        }
        
        return {
            grossWPM: Math.round(grossWPM * 100) / 100,
            netWPM: Math.round(netWPM * 100) / 100
        };
    },
    
    calculateAccuracyPoints(accuracy) {
        if (accuracy === 100) return 60;
        if (accuracy >= 95) return 55;
        if (accuracy >= 90) return 50;
        if (accuracy >= 80) return 40;
        if (accuracy >= 70) return 30;
        return 20;
    },
    
    calculateSpeedPoints(netWPM) {
        if (netWPM >= 60) return 40;
        if (netWPM >= 50) return 35;
        if (netWPM >= 40) return 30;
        if (netWPM >= 30) return 25;
        if (netWPM >= 20) return 15;
        return 10;
    },
    
    calculateTotalPoints(accuracy, netWPM) {
        const accuracyPoints = this.calculateAccuracyPoints(accuracy);
        const speedPoints = this.calculateSpeedPoints(netWPM);
        return {
            accuracyPoints,
            speedPoints,
            totalPoints: accuracyPoints + speedPoints
        };
    },
    
    getPerformanceLabel(accuracy, netWPM) {
        const { EXCELLENT, GOOD, AVERAGE } = CONFIG.PERFORMANCE;
        
        if (accuracy >= EXCELLENT.minAccuracy && netWPM >= EXCELLENT.minNetWPM) {
            return 'Excellent';
        } else if (accuracy >= GOOD.minAccuracy && netWPM >= GOOD.minNetWPM) {
            return 'Good';
        } else if (accuracy >= AVERAGE.minAccuracy && netWPM >= AVERAGE.minNetWPM) {
            return 'Average';
        } else {
            return 'Needs Practice';
        }
    },
    
    generateResults(typedText, referenceText, minutes) {
        const accuracyData = this.calculateAccuracy(typedText, referenceText);
        const wpmData = this.calculateWPM(
            accuracyData.totalTyped,
            accuracyData.correct,
            accuracyData.incorrect,
            minutes
        );
        const pointsData = this.calculateTotalPoints(accuracyData.accuracy, wpmData.netWPM);
        
        return {
            ...accuracyData,
            ...wpmData,
            ...pointsData,
            performance: this.getPerformanceLabel(accuracyData.accuracy, wpmData.netWPM)
        };
    }
};
