const CareerlyAuth = {
    // Check if user is currently logged in
    isLoggedIn: function() {
        return localStorage.getItem('careerly_token') === 'true';
    },

    // Get current user info (mocked)
    getUser: function() {
        const user = localStorage.getItem('careerly_user');
        return user ? JSON.parse(user) : null;
    },

    // Perform Login
    login: function(email, password) {
        // Mock authentication logic
        if (email && password) {
            localStorage.setItem('careerly_token', 'true');
            localStorage.setItem('careerly_user', JSON.stringify({
                email: email,
                name: email.split('@')[0],
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
            }));
            return true;
        }
        return false;
    },

    // Perform Signup
    signup: function(name, email, password) {
        // Mock signup logic
        if (name && email && password) {
            localStorage.setItem('careerly_token', 'true');
            localStorage.setItem('careerly_user', JSON.stringify({
                email: email,
                name: name,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
            }));
            return true;
        }
        return false;
    },

    // Perform Logout
    logout: function() {
        localStorage.removeItem('careerly_token');
        localStorage.removeItem('careerly_user');
        window.location.reload();
    }
};

// Export for global use
window.CareerlyAuth = CareerlyAuth;
