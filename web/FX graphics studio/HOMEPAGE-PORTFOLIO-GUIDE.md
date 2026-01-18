# Separate Homepage & Portfolio Management

Your admin panel now supports managing designs separately for **Homepage** and **Portfolio Page**.

## How It Works

### **Admin Panel Tabs**

1. **Add to Homepage** - Add designs to show on your homepage
2. **Add to Portfolio** - Add designs to your full portfolio page  
3. **Manage Homepage** - View, edit, or delete homepage designs
4. **Manage Portfolio** - View, edit, or delete portfolio designs

## Data Storage

- **Homepage items** → Stored in `portfolio-data.json` under `homepageItems`
- **Portfolio items** → Stored in `portfolio-data.json` under `portfolioItems`

Both are completely separate and independent.

## Display on Website

### **Homepage (index.html)**
- Shows your latest 6 designs (or however many you add)
- Displays in a new "Our Latest Work" section
- Automatically updates when you add items in admin panel
- Users can click "View Full Portfolio" to see all designs

### **Portfolio Page (portfolio.html)**
- Shows ALL portfolio items with filtering by category
- Independent from homepage
- Has its own filter buttons
- Completely customizable

## API Endpoints

### Portfolio Endpoints
```
GET  /api/portfolio              - Get all portfolio items
GET  /api/portfolio/:id          - Get single item
POST /api/portfolio              - Create item (auth required)
PUT  /api/portfolio/:id          - Update item (auth required)
DELETE /api/portfolio/:id        - Delete item (auth required)
GET  /api/portfolio/category/:cat - Get items by category
```

### Homepage Endpoints
```
GET  /api/homepage               - Get all homepage items
GET  /api/homepage/:id           - Get single item
POST /api/homepage               - Create item (auth required)
PUT  /api/homepage/:id           - Update item (auth required)
DELETE /api/homepage/:id         - Delete item (auth required)
```

## Example Workflow

1. **Add to Homepage** → Add 4-6 of your best designs
2. **Add to Portfolio** → Add all your designs (50+ projects)
3. Homepage shows a curated selection of your best work
4. Portfolio page shows complete collection with filters

## Example Use Cases

### Strategy 1: Showcase Best Work
- Homepage: 6 award-winning projects
- Portfolio: 100+ projects of all types

### Strategy 2: Category Showcase  
- Homepage: Latest 3 branding projects
- Portfolio: All projects (branding, web design, etc.)

### Strategy 3: Client Focus
- Homepage: Work for specific industries
- Portfolio: All types of work

## Important Notes

✅ **Complete Independence** - Adding to homepage doesn't affect portfolio
✅ **No Limits** - Add as many items as you want
✅ **Easy Curation** - Delete items from homepage without deleting from portfolio
✅ **Persistent Storage** - All data saved in JSON file
✅ **Categories** - Use same categories on both or different ones

## To Test

1. Login to admin panel
2. Go to "Add to Homepage" tab
3. Add 3-4 designs with images
4. Visit `http://localhost:5000/index.html`
5. You should see "Our Latest Work" section with your designs
6. Go to "Add to Portfolio" tab
7. Add more designs
8. Visit portfolio.html to see them all with filters

## Customization Ideas

You could add filters to homepage too:
- Feature only recent designs
- Show only specific categories
- Display by client/project type
- Rotate designs weekly

Let me know if you need help with any customizations!
