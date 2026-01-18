# FX Graphics Portfolio Backend Setup

This backend system allows you to manage your portfolio through an admin panel. Items can be uploaded, edited, and deleted dynamically.

## Features

✅ Admin authentication with JWT tokens  
✅ Portfolio CRUD operations (Create, Read, Update, Delete)  
✅ Image upload with validation  
✅ Change admin password  
✅ Category-based filtering  
✅ Persistent JSON database  
✅ CORS enabled for frontend communication  

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Steps

1. **Navigate to your project folder:**
   ```bash
   cd "c:\Users\Felix\OneDrive\Desktop\web\FX graphics studio"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the admin panel:**
   - Open your browser and go to: `http://localhost:5000/admin.html`
   - Default credentials:
     - Username: `admin`
     - Password: `password123`

## 🔒 Security - IMPORTANT!

**⚠️ Change your admin password immediately after first login!**

1. Go to the Change Password button in the admin panel
2. Enter your current password and new password
3. For production, also:
   - Change the `SECRET_KEY` in `server.js`
   - Use environment variables for sensitive data
   - Set up HTTPS/SSL
   - Use a proper database (MongoDB, PostgreSQL, etc.)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/change-password` - Change admin password (requires token)

### Portfolio
- `GET /api/portfolio` - Get all portfolio items
- `GET /api/portfolio/:id` - Get single portfolio item
- `GET /api/portfolio/category/:category` - Get items by category
- `POST /api/portfolio` - Create new portfolio item (requires token)
- `PUT /api/portfolio/:id` - Update portfolio item (requires token)
- `DELETE /api/portfolio/:id` - Delete portfolio item (requires token)

## File Structure

```
├── server.js                 # Express backend
├── admin.html               # Admin panel interface
├── portfolio-data.json      # Database file (auto-created)
├── package.json            # Dependencies
├── images/                 # Portfolio images folder (auto-created)
└── assets/                 # Existing website files
    ├── css/
    ├── js/
    └── ...
```

## Data Format

Each portfolio item has this structure:
```json
{
  "id": "timestamp",
  "title": "Project Name",
  "description": "Project description",
  "category": "branding",
  "link": "https://example.com",
  "image": "/images/filename.jpg",
  "createdAt": "2026-01-18T...",
  "updatedAt": "2026-01-18T..."
}
```

## Categories

- branding
- web-design
- ui-ux
- illustration
- photography
- motion
- other

## Integrating with Your Website

To display portfolio items dynamically on your portfolio.html:

```javascript
// Fetch portfolio from backend
fetch('http://localhost:5000/api/portfolio')
  .then(res => res.json())
  .then(items => {
    // Render items in your gallery
    const gallery = document.querySelector('.gallery-grid');
    gallery.innerHTML = items.map(item => `
      <div class="gallery-item" data-category="${item.category}">
        <img src="${item.image}" alt="${item.title}">
        <div class="gallery-overlay">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');
  });
```

## Troubleshooting

**Port already in use:**
```bash
# Use a different port
PORT=3000 npm start
```

**CORS errors:**
- Make sure the backend is running on localhost:5000
- Check that frontend requests match the API_BASE URL in admin.html

**File upload issues:**
- Max file size is 10MB
- Only image files allowed (jpeg, jpg, png, gif, webp)
- Ensure `/images` folder has write permissions

**Database issues:**
- portfolio-data.json is auto-created on first run
- If corrupted, delete it and restart the server

## Next Steps

1. ✅ Change admin password
2. ✅ Add your portfolio items through the admin panel
3. ✅ Update portfolio.html to fetch from `/api/portfolio`
4. ✅ Deploy to production with proper security measures

## Support

For issues or questions about the backend, check:
- Console errors in browser (F12)
- Server terminal output
- portfolio-data.json file content
