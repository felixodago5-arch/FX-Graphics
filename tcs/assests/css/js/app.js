// Teacher Portal - Main JavaScript File

// DOM Ready Function
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme based on user preference
  initTheme();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize page-specific functionality
  initPageFunctions();
  
  // Initialize tooltips if needed
  initTooltips();
});

// Theme Toggle Functionality
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
  
  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update icon based on current theme
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  // Add click event to toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Update theme
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update icon
      if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      
      // Dispatch custom event for other components to react
      document.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
    });
  }
}

// Mobile Menu Functionality
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      if (overlay) overlay.classList.toggle('active');
    });
  }
  
  // Close sidebar when clicking on overlay
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  }
  
  // Close sidebar when clicking on a link (for mobile)
  const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth < 992) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
      }
    });
  });
}

// Page-specific functionality
function initPageFunctions() {
  // Get current page from body class or path
  const bodyClass = document.body.className;
  const currentPage = bodyClass || window.location.pathname.split('/').pop().replace('.html', '');
  
  // Initialize functions based on current page
  switch(currentPage) {
    case 'dashboard':
      initDashboard();
      break;
    case 'materials':
      initMaterials();
      break;
    case 'announcements':
      initAnnouncements();
      break;
    case 'profile':
      initProfile();
      break;
    case 'admin':
      initAdmin();
      break;
    case 'login':
      initLogin();
      break;
    default:
      // Homepage or other pages
      break;
  }
}

// Dashboard Page Functions
function initDashboard() {
  console.log('Dashboard page initialized');
  
  // Sample data for dashboard cards
  const cardData = [
    { id: 'materials', count: 24, text: 'teaching materials available' },
    { id: 'subjects', count: 5, text: 'subjects you teach' },
    { id: 'announcements', count: 3, text: 'new announcements' },
    { id: 'timetable', count: 6, text: 'classes this week' }
  ];
  
  // Update card counts (if elements exist)
  cardData.forEach(data => {
    const countElement = document.getElementById(`${data.id}-count`);
    if (countElement) {
      countElement.textContent = data.count;
    }
  });
}

// Materials Page Functions
function initMaterials() {
  console.log('Materials page initialized');
  
  // Filter functionality
  const subjectFilter = document.getElementById('subjectFilter');
  const classFilter = document.getElementById('classFilter');
  const termFilter = document.getElementById('termFilter');
  
  // Sample filter change handler
  [subjectFilter, classFilter, termFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', function() {
        // In a real app, this would filter materials
        console.log('Filter changed:', this.id, this.value);
        // Show loading state
        const materialsGrid = document.querySelector('.materials-grid');
        if (materialsGrid) {
          materialsGrid.style.opacity = '0.7';
          // Simulate API call delay
          setTimeout(() => {
            materialsGrid.style.opacity = '1';
            showNotification('Materials filtered successfully', 'success');
          }, 300);
        }
      });
    }
  });
  
  // Download button handlers
  const downloadButtons = document.querySelectorAll('.btn-download');
  downloadButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const fileName = this.getAttribute('data-file');
      showNotification(`Downloading ${fileName}...`, 'info');
      
      // Simulate download delay
      setTimeout(() => {
        showNotification(`${fileName} downloaded successfully`, 'success');
      }, 1000);
    });
  });
  
  // Preview button handlers
  const previewButtons = document.querySelectorAll('.btn-preview');
  previewButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const fileName = this.getAttribute('data-file');
      showNotification(`Opening preview of ${fileName}...`, 'info');
      
      // In a real app, this would open a modal with file preview
      setTimeout(() => {
        showNotification(`Preview opened for ${fileName}`, 'success');
      }, 500);
    });
  });
}

// Announcements Page Functions
function initAnnouncements() {
  console.log('Announcements page initialized');
  
  // Sample announcement data
  const announcements = [
    { title: 'School Reopens', date: '2023-09-01', content: 'School will reopen on September 5th after summer break. All teachers are requested to be present for the staff meeting at 9 AM.' },
    { title: 'Staff Meeting', date: '2023-08-25', content: 'There will be a staff meeting on Friday to discuss the new academic year curriculum and assignments.' },
    { title: 'Professional Development Workshop', date: '2023-08-20', content: 'A professional development workshop on "Modern Teaching Methods" will be held next week. Please register by Wednesday.' }
  ];
  
  // If no announcements exist on page, populate with sample data
  const announcementsList = document.querySelector('.announcements-list');
  if (announcementsList && announcementsList.children.length === 0) {
    announcements.forEach(announcement => {
      const announcementCard = document.createElement('div');
      announcementCard.className = 'announcement-card';
      announcementCard.innerHTML = `
        <div class="announcement-header">
          <h3>${announcement.title}</h3>
          <div class="announcement-date">${formatDate(announcement.date)}</div>
        </div>
        <p>${announcement.content}</p>
      `;
      announcementsList.appendChild(announcementCard);
    });
  }
}

// Profile Page Functions
function initProfile() {
  console.log('Profile page initialized');
  
  // Edit profile button handler
  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', function() {
      showNotification('Edit profile feature would open a form in a real application', 'info');
      
      // In a real app, this would open an edit form
      const detailRows = document.querySelectorAll('.detail-value');
      detailRows.forEach(row => {
        row.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        row.setAttribute('contenteditable', 'true');
      });
      
      // Change button text
      editProfileBtn.textContent = 'Save Changes';
      editProfileBtn.classList.remove('btn-outline');
      editProfileBtn.classList.add('btn-primary');
      
      // Change button action
      editProfileBtn.removeEventListener('click', arguments.callee);
      editProfileBtn.addEventListener('click', function() {
        showNotification('Profile updated successfully!', 'success');
        
        // Reset UI
        detailRows.forEach(row => {
          row.style.backgroundColor = '';
          row.removeAttribute('contenteditable');
        });
        
        editProfileBtn.textContent = 'Edit Profile';
        editProfileBtn.classList.remove('btn-primary');
        editProfileBtn.classList.add('btn-outline');
        
        // Reattach original event listener
        editProfileBtn.addEventListener('click', initProfile);
      });
    });
  }
}

// Admin Page Functions
function initAdmin() {
  console.log('Admin page initialized');
  
  // File upload area functionality
  const fileUploadArea = document.querySelector('.file-upload');
  if (fileUploadArea) {
    // Click to upload
    fileUploadArea.addEventListener('click', function() {
      // In a real app, this would trigger file input
      showNotification('File upload dialog would open in a real application', 'info');
    });
    
    // Drag and drop (basic visual feedback)
    fileUploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.style.borderColor = 'var(--primary-color)';
      this.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    });
    
    fileUploadArea.addEventListener('dragleave', function() {
      this.style.borderColor = '';
      this.style.backgroundColor = '';
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.style.borderColor = '';
      this.style.backgroundColor = '';
      showNotification('File would be uploaded in a real application', 'info');
    });
  }
  
  // Form submission handlers
  const adminForms = document.querySelectorAll('.admin-form');
  adminForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const formName = this.querySelector('h3') ? this.querySelector('h3').textContent : 'Form';
      showNotification(`${formName} submitted successfully!`, 'success');
      
      // Reset form after submission
      setTimeout(() => {
        this.reset();
      }, 1000);
    });
  });
}

// Login Page Functions
function initLogin() {
  console.log('Login page initialized');
  
  // Google Login button handler
  const googleLoginBtn = document.querySelector('.btn-google');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showNotification('Redirecting to Google authentication...', 'info');
      
      // Simulate authentication delay
      setTimeout(() => {
        // In a real app, this would redirect to Google OAuth
        // For demo, redirect to dashboard
        window.location.href = 'dashboard.html';
      }, 1500);
    });
  }
}

// Tooltip Initialization
function initTooltips() {
  // Simple tooltip implementation
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      const tooltipText = this.getAttribute('data-tooltip');
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'var(--dark-color)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px 10px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '0.85rem';
      tooltip.style.zIndex = '10000';
      
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
      tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
      
      this._tooltip = tooltip;
    });
    
    element.addEventListener('mouseleave', function() {
      if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
      }
    });
  });
}

// Notification System
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Style the notification
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = 'var(--border-radius)';
  notification.style.boxShadow = 'var(--shadow-lg)';
  notification.style.zIndex = '10000';
  notification.style.fontWeight = '500';
  notification.style.transition = 'all 0.3s ease';
  notification.style.transform = 'translateX(100%)';
  notification.style.opacity = '0';
  
  // Set colors based on type
  const colors = {
    info: { bg: '#3b82f6', text: 'white' },
    success: { bg: '#10b981', text: 'white' },
    warning: { bg: '#f59e0b', text: 'white' },
    error: { bg: '#ef4444', text: 'white' }
  };
  
  notification.style.backgroundColor = colors[type] ? colors[type].bg : colors.info.bg;
  notification.style.color = colors[type] ? colors[type].text : colors.info.text;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Set active navigation link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  const navLinks = document.querySelectorAll('.nav-links a, .sidebar-menu a');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').replace('.html', '');
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index') ||
        (currentPage === 'index' && linkPage === 'index')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Initialize active nav links
setActiveNavLink();