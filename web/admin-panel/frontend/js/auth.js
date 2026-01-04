// API Configuration
const API_URL = 'http://localhost:5000/api';

// Login function that connects to backend
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error');
    const loginBtn = document.getElementById('loginBtn');
    
    // Clear previous error
    errorElement.textContent = '';
    errorElement.style.color = '#e74c3c';
    
    // Validation
    if (!email || !password) {
        errorElement.textContent = 'Please fill in all fields';
        shakeInputs();
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Please enter a valid email address';
        shakeInputs();
        return;
    }
    
    // Disable button and show loading
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for cookies
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Check if user is admin
        if (data.user.role !== 'admin') {
            throw new Error('Admin access required');
        }
        
        // Store user data in localStorage
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        
        // Show success
        errorElement.style.color = '#27ae60';
        errorElement.textContent = 'Login successful!';
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
        
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = error.message || 'Invalid email or password';
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        loginBtn.disabled = false;
        shakeInputs();
    }
}

function shakeInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.animation = 'shake 0.5s';
        input.style.borderColor = '#e74c3c';
        
        setTimeout(() => {
            input.style.animation = '';
            input.style.borderColor = '#ddd';
        }, 500);
    });
}

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .input-error {
            border-color: #e74c3c !important;
            background-color: #ffe6e6;
        }
    `;
    document.head.appendChild(style);
    
    // Check if user is already logged in
    checkSession();
    
    // Add Enter key support
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
    
    document.getElementById('email').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('password').focus();
        }
    });
    
    // Add input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
            this.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '#ddd';
            this.style.boxShadow = 'none';
        });
    });
});

async function checkSession() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Valid session, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        // Session invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
    }
}
