/**
 * Homepage Portfolio Section Loader
 * Loads latest designs from backend to display on homepage
 */

const API_BASE = 'https://fx-graphics-dsfz3l8pb-felixs-projects-342450b4.vercel.app/api';

// Load homepage items
async function loadHomepagePortfolio() {
    try {
        const response = await fetch(`${API_BASE}/homepage`);
        if (!response.ok) throw new Error('Failed to load homepage items');
        
        const items = await response.json();
        
        if (items.length === 0) {
            console.log('No homepage items yet');
            return;
        }

        renderHomepagePortfolio(items);
    } catch (error) {
        console.warn('Could not load homepage portfolio from backend:', error.message);
        // Gracefully continue if backend is unavailable
    }
}

// Render homepage portfolio items
function renderHomepagePortfolio(items) {
    const portfolioSection = document.querySelector('.latest-work .portfolio-grid');
    
    if (!portfolioSection) {
        console.warn('Portfolio grid element not found on homepage');
        return;
    }

    portfolioSection.innerHTML = items.map((item, index) => `
        <div class="gallery-item fade-in stagger-item" style="animation-delay: ${index * 100}ms;" data-category="${item.category}">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="gallery-overlay">
                <h3>${item.title}</h3>
                <p>${item.description || 'Creative design project'}</p>
                ${item.link ? `<a href="${item.link}" target="_blank" class="view-link">View Project</a>` : ''}
            </div>
        </div>
    `).join('');

    // Reinitialize gallery functionality if available
    if (typeof initGallery === 'function') {
        initGallery();
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHomepagePortfolio();
});
