// Admin Panel Logic
const AdminPanel = {
    scores: [],
    filteredScores: [],
    
    init() {
        this.loadParagraph();
        this.loadScores();
        this.setupEventListeners();
        this.updateStatistics();
        this.renderScoresTable();
    },
    
    setupEventListeners() {
        // Paragraph management
        document.getElementById('paragraph-input').addEventListener('input', (e) => {
            this.updateParagraphStats(e.target.value);
        });
        
        document.getElementById('save-paragraph-btn').addEventListener('click', () => {
            this.saveParagraph();
        });
        
        // Search and filter
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterScores(e.target.value);
        });
        
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortScores(e.target.value);
        });
        
        // Action buttons
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadScores();
            this.showNotification('Data refreshed!');
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAllData();
        });
        
        // Modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('details-modal').addEventListener('click', (e) => {
            if (e.target.id === 'details-modal') {
                this.closeModal();
            }
        });
    },
    
    loadParagraph() {
        const saved = localStorage.getItem('testParagraph');
        const paragraph = saved || CONFIG.PARAGRAPH;
        document.getElementById('paragraph-input').value = paragraph;
        this.updateParagraphStats(paragraph);
    },
    
    updateParagraphStats(text) {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        document.getElementById('word-count').textContent = words;
        document.getElementById('char-count-display').textContent = chars;
    },
    
    saveParagraph() {
        const paragraph = document.getElementById('paragraph-input').value.trim();
        if (paragraph.length < 50) {
            alert('Paragraph is too short! Please enter at least 50 characters.');
            return;
        }
        
        localStorage.setItem('testParagraph', paragraph);
        CONFIG.PARAGRAPH = paragraph;
        this.showNotification('Paragraph saved successfully!');
    },
    
    loadScores() {
        const saved = localStorage.getItem('userScores');
        this.scores = saved ? JSON.parse(saved) : [];
        this.filteredScores = [...this.scores];
        this.updateStatistics();
        this.renderScoresTable();
    },
    
    filterScores(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredScores = this.scores.filter(score => 
            score.userName.toLowerCase().includes(term) ||
            score.rollNumber.toLowerCase().includes(term)
        );
        this.renderScoresTable();
    },
    
    sortScores(sortBy) {
        switch(sortBy) {
            case 'date-desc':
                this.filteredScores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'date-asc':
                this.filteredScores.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'accuracy-desc':
                this.filteredScores.sort((a, b) => b.accuracy - a.accuracy);
                break;
            case 'wpm-desc':
                this.filteredScores.sort((a, b) => b.netWPM - a.netWPM);
                break;
            case 'name-asc':
                this.filteredScores.sort((a, b) => a.userName.localeCompare(b.userName));
                break;
        }
        this.renderScoresTable();
    },
    
    updateStatistics() {
        const totalUsers = this.scores.length;
        document.getElementById('total-users').textContent = totalUsers;
        
        if (totalUsers === 0) {
            document.getElementById('avg-accuracy').textContent = '0%';
            document.getElementById('avg-wpm').textContent = '0';
            document.getElementById('top-performer').textContent = '-';
            return;
        }
        
        const avgAccuracy = this.scores.reduce((sum, s) => sum + s.accuracy, 0) / totalUsers;
        const avgWPM = this.scores.reduce((sum, s) => sum + s.netWPM, 0) / totalUsers;
        
        document.getElementById('avg-accuracy').textContent = avgAccuracy.toFixed(1) + '%';
        document.getElementById('avg-wpm').textContent = avgWPM.toFixed(1);
        
        const topPerformer = this.scores.reduce((top, current) => 
            current.netWPM > top.netWPM ? current : top
        );
        document.getElementById('top-performer').textContent = topPerformer.userName;
    },
    
    renderScoresTable() {
        const tbody = document.getElementById('scores-tbody');
        
        if (this.filteredScores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="no-data">No test results available</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.filteredScores.map((score, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${this.escapeHtml(score.userName)}</td>
                <td>${this.escapeHtml(score.rollNumber)}</td>
                <td>${score.accuracy.toFixed(2)}%</td>
                <td>${score.netWPM.toFixed(2)}</td>
                <td>${score.accuracyPoints || '-'}</td>
                <td>${score.speedPoints || '-'}</td>
                <td><strong>${score.totalPoints || '-'}</strong></td>
                <td><span class="performance-badge performance-${this.getPerformanceClass(score.performance)}">${score.performance}</span></td>
                <td>${this.formatDate(score.timestamp)}</td>
                <td>
                    <button class="action-btn btn-view" onclick="AdminPanel.viewDetails(${index})">View</button>
                    <button class="action-btn btn-delete" onclick="AdminPanel.deleteScore(${index})">Delete</button>
                </td>
            </tr>
        `).join('');
    },
    
    getPerformanceClass(performance) {
        const map = {
            'Excellent': 'excellent',
            'Good': 'good',
            'Average': 'average',
            'Needs Practice': 'needs'
        };
        return map[performance] || 'needs';
    },
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    viewDetails(index) {
        const score = this.filteredScores[index];
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Name</div>
                    <div class="detail-value">${this.escapeHtml(score.userName)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Roll Number</div>
                    <div class="detail-value">${this.escapeHtml(score.rollNumber)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Accuracy</div>
                    <div class="detail-value">${score.accuracy.toFixed(2)}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Net WPM</div>
                    <div class="detail-value">${score.netWPM.toFixed(2)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Accuracy Points (60)</div>
                    <div class="detail-value" style="color: var(--primary)">${score.accuracyPoints || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Speed Points (40)</div>
                    <div class="detail-value" style="color: var(--secondary)">${score.speedPoints || '-'}</div>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <div class="detail-label">Total Score (100)</div>
                    <div class="detail-value" style="font-size: 2rem; color: var(--success)">${score.totalPoints || '-'}</div>
                </div>
            </div>
            <div class="typed-comparison-modal">
                <h4>Typed Text:</h4>
                <div class="comparison-container">
                    <div class="typed-text-display">${this.highlightTypedText(score.typedText, score.referenceText)}</div>
                </div>
            </div>
        `;
        
        document.getElementById('details-modal').classList.add('active');
    },
    
    highlightTypedText(typedText, referenceText) {
        if (!typedText || typedText.length === 0) {
            return '<em style="color: var(--text-secondary);">No text was typed</em>';
        }
        
        let html = '';
        for (let i = 0; i < typedText.length; i++) {
            const typedChar = typedText[i];
            const refChar = i < referenceText.length ? referenceText[i] : null;
            
            if (refChar === null) {
                html += `<span class="char-extra">${this.escapeHtml(typedChar)}</span>`;
            } else if (typedChar === refChar) {
                html += `<span class="char-correct">${this.escapeHtml(typedChar)}</span>`;
            } else {
                html += `<span class="char-incorrect">${this.escapeHtml(typedChar)}</span>`;
            }
        }
        return html;
    },
    
    closeModal() {
        document.getElementById('details-modal').classList.remove('active');
    },
    
    deleteScore(index) {
        if (!confirm('Are you sure you want to delete this score?')) return;
        
        const scoreToDelete = this.filteredScores[index];
        const originalIndex = this.scores.findIndex(s => 
            s.userName === scoreToDelete.userName && 
            s.timestamp === scoreToDelete.timestamp
        );
        
        this.scores.splice(originalIndex, 1);
        localStorage.setItem('userScores', JSON.stringify(this.scores));
        
        this.loadScores();
        this.showNotification('Score deleted successfully!');
    },
    
    clearAllData() {
        if (!confirm('Are you sure you want to clear ALL user scores? This cannot be undone!')) return;
        
        localStorage.removeItem('userScores');
        this.scores = [];
        this.filteredScores = [];
        this.updateStatistics();
        this.renderScoresTable();
        this.showNotification('All data cleared!');
    },
    
    exportData() {
        if (this.scores.length === 0) {
            alert('No data to export!');
            return;
        }
        
        const csv = this.convertToCSV(this.scores);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typing-test-scores-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!');
    },
    
    convertToCSV(data) {
        const headers = ['Name', 'Roll Number', 'Accuracy (%)', 'Net WPM', 'Accuracy Points (60)', 'Speed Points (40)', 'Total Score (100)', 'Performance', 'Date & Time'];
        const rows = data.map(score => [
            score.userName,
            score.rollNumber,
            score.accuracy.toFixed(2),
            score.netWPM.toFixed(2),
            score.accuracyPoints || '-',
            score.speedPoints || '-',
            score.totalPoints || '-',
            score.performance,
            this.formatDate(score.timestamp)
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
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
        return String(text).replace(/[&<>"' ]/g, m => map[m]);
    },
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    AdminPanel.init();
});
