// Google Authentication Configuration
const GOOGLE_CLIENT_ID = "469988117947-do10thnb1dt23u0ppjbv63q5r9dbfcuo.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "http://localhost:3001/auth/google/callback";

// Initialize Google Sign-In
function initializeGoogleAuth() {
    // Load Google Sign-In library
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            cookiepolicy: 'single_host_origin',
            scope: 'profile email'
        }).then(function() {
            console.log('Google Auth initialized successfully');
            attachGoogleSignInListeners();
        }).catch(function(error) {
            console.error('Error initializing Google Auth:', error);
        });
    });
}

// Attach click listeners to Google Sign-In buttons
function attachGoogleSignInListeners() {
    const googleSignInButtons = document.querySelectorAll('.google-signin-btn');
    googleSignInButtons.forEach(button => {
        button.addEventListener('click', handleGoogleSignIn);
    });
}

// Handle Google Sign-In
function handleGoogleSignIn() {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn().then(function(googleUser) {
        const profile = googleUser.getBasicProfile();
        const idToken = googleUser.getAuthResponse().id_token;
        
        const userData = {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
            idToken: idToken
        };

        // Send user data to your backend for verification and login
        authenticateWithBackend(userData);
    }).catch(function(error) {
        console.error('Google Sign-In error:', error);
        showNotification('Google Sign-In failed. Please try again.', 'error');
    });
}

// Send authentication data to backend
async function authenticateWithBackend(userData) {
    try {
        const response = await fetch('/auth/google/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Store authentication token
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('userProfile', JSON.stringify(result.user));
            
            showNotification('Login successful!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            throw new Error(result.message || 'Authentication failed');
        }
    } catch (error) {
        console.error('Backend authentication error:', error);
        showNotification('Authentication failed. Please try again.', 'error');
    }
}

// Google Sign-Out
function handleGoogleSignOut() {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(function() {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
        
        showNotification('Logged out successfully', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    });
}

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userProfile = localStorage.getItem('userProfile');
    
    if (token && userProfile) {
        try {
            const user = JSON.parse(userProfile);
            updateUIForAuthenticatedUser(user);
            return true;
        } catch (error) {
            console.error('Error parsing user profile:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userProfile');
        }
    }
    return false;
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
    // Update user name in navbar
    const userNameElements = document.querySelectorAll('#uname, #userProfile');
    userNameElements.forEach(element => {
        if (element) {
            element.textContent = user.name || 'User';
        }
    });

    // Update user profile image if available
    const userImageElements = document.querySelectorAll('.user-profile-img');
    userImageElements.forEach(element => {
        if (element && user.imageUrl) {
            element.src = user.imageUrl;
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Google API is available
    if (typeof gapi !== 'undefined') {
        initializeGoogleAuth();
    } else {
        console.warn('Google API not loaded. Please include the Google API script.');
    }
    
    // Check authentication status on page load
    checkAuthStatus();
    
    // Attach logout listeners
    const logoutButtons = document.querySelectorAll('#logoutButton, #Logout_button');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleGoogleSignOut();
        });
    });
});