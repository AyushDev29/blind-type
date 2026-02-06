// Input handling and validation
const InputHandler = {
    typingArea: null,
    isTestActive: false,
    
    init(textareaElement) {
        this.typingArea = textareaElement;
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Prevent copy/paste
        this.typingArea.addEventListener('copy', (e) => e.preventDefault());
        this.typingArea.addEventListener('paste', (e) => e.preventDefault());
        this.typingArea.addEventListener('cut', (e) => e.preventDefault());
        
        // Prevent right click
        this.typingArea.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent text selection
        this.typingArea.addEventListener('selectstart', (e) => e.preventDefault());
        
        // Disable autocomplete attributes
        this.typingArea.setAttribute('autocomplete', 'off');
        this.typingArea.setAttribute('autocorrect', 'off');
        this.typingArea.setAttribute('autocapitalize', 'off');
        this.typingArea.setAttribute('spellcheck', 'false');
    },
    
    enable() {
        this.isTestActive = true;
        this.typingArea.disabled = false;
        this.typingArea.value = '';
        this.typingArea.focus();
    },
    
    disable() {
        this.isTestActive = false;
        this.typingArea.disabled = true;
    },
    
    getValue() {
        return this.typingArea.value;
    },
    
    clear() {
        this.typingArea.value = '';
    }
};

// Form validation
const Validator = {
    validateName(name) {
        const trimmed = name.trim();
        if (trimmed.length === 0) {
            return { valid: false, message: 'Name is required' };
        }
        if (trimmed.length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters' };
        }
        return { valid: true, value: trimmed };
    },
    
    validateRollNumber(rollNumber) {
        const trimmed = rollNumber.trim();
        if (trimmed.length === 0) {
            return { valid: false, message: 'Roll number is required' };
        }
        
        // Only alphanumeric characters allowed
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(trimmed)) {
            return { valid: false, message: 'Roll number must contain only letters and numbers' };
        }
        
        return { valid: true, value: trimmed };
    }
};
