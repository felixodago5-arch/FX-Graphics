# Deploy to Vercel - Step by Step

Your GitHub repo is ready! Now let's deploy your backend to Vercel.

## **Step 1: Create Vercel Account**

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. Done! ✅

## **Step 2: Import Your Project**

1. After login, click **"New Project"**
2. Select **"Import Git Repository"**
3. Find and select: **`FX-Graphics`**
4. Click **"Import"**

## **Step 3: Configure Project**

Vercel should auto-detect your settings:
- **Framework**: Node.js ✅
- **Root Directory**: ./
- **Build Command**: Leave empty (or `npm install`)
- **Output Directory**: ./
- **Install Command**: `npm install`

Click **"Deploy"** 🚀

## **Step 4: Get Your Vercel URL**

After deployment completes:
1. You'll see a success page
2. Your URL will look like: `https://fx-graphics-xyz.vercel.app`
3. **Copy this URL** - you'll need it next

## **Step 5: Add Environment Variable**

In Vercel Dashboard:
1. Go to your project settings
2. Find **"Environment Variables"**
3. Add:
   - **Name**: `SECRET_KEY`
   - **Value**: `your-super-secret-key-here`
4. Click **"Add"**
5. Redeploy (Vercel will auto-redeploy)

## **Step 6: Update Your Code**

Once you have your Vercel URL (e.g., `https://fx-graphics-xyz.vercel.app`):

**In `admin.html` - Change this line:**
```javascript
// OLD:
const API_BASE = 'http://localhost:5000/api';

// NEW:
const API_BASE = 'https://fx-graphics-xyz.vercel.app/api';
```

**In `portfolio.html` - Change this line:**
```javascript
// OLD:
const API_BASE = 'http://localhost:5000/api';

// NEW:
const API_BASE = 'https://fx-graphics-xyz.vercel.app/api';
```

**In `js/homepage-portfolio.js` - Change this line:**
```javascript
// OLD:
const API_BASE = 'http://localhost:5000/api';

// NEW:
const API_BASE = 'https://fx-graphics-xyz.vercel.app/api';
```

## **Step 7: Test It**

1. Go to your Vercel URL
2. Visit `/admin.html`
3. Login with:
   - Username: `admin`
   - Password: `password123` (or your new password)
4. Test adding a portfolio item
5. Check if it appears on portfolio page ✅

## **Step 8: Push Changes to GitHub**

After updating URLs:
```bash
git add .
git commit -m "Update API URLs to Vercel backend"
git push
```

GitHub Pages will auto-update! 🎉

## **Troubleshooting**

**"Cannot GET /api/homepage"?**
- Check your Vercel URL is correct
- Make sure you copied it exactly
- Verify Environment Variable is set

**Images not uploading?**
- Vercel serverless functions have limitations
- Images are stored in `portfolio-data.json`
- This works fine for small projects

**Need to change admin password?**
- Go to: `https://your-vercel-url/admin.html`
- Login → Click "Change Password"

## **Your Final URLs**

- 🌐 **Frontend (GitHub Pages)**: https://github.com/felixodago5-arch/FX-Graphics
- 🔐 **Admin Panel**: https://your-vercel-url/admin.html
- 📊 **Portfolio API**: https://your-vercel-url/api/portfolio
- 🎨 **Homepage API**: https://your-vercel-url/api/homepage

Done! Your full stack is now online! 🚀
