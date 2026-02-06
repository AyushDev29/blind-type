// Simple routing system for admin panel access
const Router = {
    init() {
        this.checkRoute();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.checkRoute();
        });
        
        // Also check on page load
        window.addEventListener('load', () => {
            this.checkRoute();
        });
    },
    
    checkRoute() {
        const hash = window.location.hash;
        const pathname = window.location.pathname;
        
        // Check if hash is #admin or #/admin
        if (hash === '#admin' || hash === '#/admin') {
            this.loadAdminPanel();
            return;
        }
        
        // Check if pathname ends with /admin
        if (pathname.endsWith('/admin')) {
            this.loadAdminPanel();
            return;
        }
    },
    
    loadAdminPanel() {
        // Prevent infinite redirect loop
        if (window.location.pathname.includes('admin.html')) {
            return;
        }
        
        // Get current location
        const currentUrl = window.location.href;
        
        // Remove hash if present
        const baseUrl = currentUrl.split('#')[0];
        
        // Get directory path
        let directory = '';
        if (baseUrl.includes('index.html')) {
            directory = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
        } else {
            directory = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        }
        
        // Navigate to admin.html
        window.location.replace(directory + 'admin.html');
    }
};

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Router.init());
} else {
    Router.init();
}
