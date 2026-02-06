# Blind Typing Skill Assessment

A professional blind typing test website designed for exam-ready usability with accurate WPM calculation and strict accuracy tracking.

## Features

### Core Functionality
- **Blind Typing Mode**: Users type without seeing their input - only character count and time are visible
- **Real WPM Calculation**: Accurate Gross and Net WPM based on standard formulas
- **Accuracy Tracking**: Character-by-character comparison with live accuracy display
- **Multiple Time Options**: 50 seconds, 3 minutes, 5 minutes, 10 minutes

### User Flow
1. **Landing Screen**: Clean introduction with start button
2. **User Details**: Mandatory name and roll number (locked after submission)
3. **Test Setup**: View reference paragraph and select time duration
4. **Typing Test**: Split-screen with reference text and blind typing area
5. **Results**: Comprehensive performance metrics and retry options

### Security Features
- Copy/paste disabled
- Right-click disabled
- Text selection prevented
- Autocomplete disabled
- Tab switch warning
- Page refresh confirmation during test

### Scoring System
- **Accuracy**: `(correct / totalTyped) × 100`
- **Gross WPM**: `(totalTyped / 5) / minutes`
- **Net WPM**: `((correct - incorrect) / 5) / minutes` (minimum 0)
- **Performance Labels**: Excellent / Good / Average / Needs Practice

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Professional styling
├── js/
│   ├── config.js       # Configuration and constants
│   ├── timer.js        # Timer management
│   ├── scoring.js      # WPM and accuracy calculations
│   ├── inputHandler.js # Input validation and handling
│   └── app.js          # Main application logic
└── README.md
```

## Usage

1. Open `index.html` in a modern web browser
2. Click "Start Test"
3. Enter your full name and roll number
4. Review the paragraph and select time duration
5. Click "Begin Test" and start typing
6. Timer starts on first keystroke
7. View results when time expires

## Admin Panel

Access the admin panel in one of these ways:

1. **Using Hash Route**: Add `#admin` to your main page URL
   - Example: `http://127.0.0.1:5500/index.html#admin`
   - This will automatically redirect to the admin panel

2. **Direct Access**: Open `admin.html` directly
   - Example: `http://127.0.0.1:5500/admin.html`

### Admin Features:
- **Paragraph Management**: Edit and save custom test paragraphs
- **User Scores Dashboard**: View all test results in a sortable table
- **Statistics Overview**: See aggregate metrics (total users, average accuracy, average WPM, top performer)
- **Search & Filter**: Find specific users by name or roll number
- **Sort Options**: Sort by date, accuracy, WPM, or name
- **View Details**: See complete test details including typed text with highlighting
- **Export Data**: Download all scores as CSV file
- **Delete Scores**: Remove individual test results
- **Clear All Data**: Reset all user scores

### Admin Panel Access:
Add `#admin` to your URL (e.g., `http://127.0.0.1:5500/index.html#admin`) or open `admin.html` directly.

## Technical Details

- Pure HTML, CSS, JavaScript (no frameworks)
- Modular architecture with separated concerns
- Responsive design (mobile + desktop)
- No external dependencies
- No server required - runs entirely client-side

## Customization

To change the test paragraph, edit `CONFIG.PARAGRAPH` in `js/config.js`:

```javascript
PARAGRAPH: `Your custom paragraph here...`
```

To adjust performance thresholds, modify `CONFIG.PERFORMANCE` in `js/config.js`.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## Notes

- Backspace is allowed and affects accuracy
- Negative WPM is prevented (shows 0 instead)
- Timer starts only after first keystroke
- Test auto-submits when time reaches zero
- All calculations use standard typing test formulas
