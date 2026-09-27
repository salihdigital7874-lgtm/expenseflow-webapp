# InfinityFree Web Hosting Deployment Guide for ExpenseFlow / SalihPort

InfinityFree is a free static/PHP web hosting platform. Because InfinityFree does NOT run persistent Node.js background services, it serves your compiled frontend (`dist/`), which connects to your POCO Android phone server over HTTPS API.

---

## Step 1: Configure Environment Variables for Frontend Build

In your project root `.env` file on your development machine, set your public tunnel API base URL:

```env
VITE_API_BASE_URL=https://salihport-demo.trycloudflare.com
```

---

## Step 2: Build Production Assets

Run Vite production build:

```bash
npm run build
```

This compiles your application into single-page application static files inside the `dist/` folder:
- `dist/index.html`
- `dist/assets/*.js`
- `dist/assets/*.css`

---

## Step 3: Configure `.htaccess` for Single Page Application Routing

Create a `.htaccess` file inside your `dist/` directory before uploading:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Step 4: Upload to InfinityFree via File Manager / FTP

1. Log into your **InfinityFree Control Panel**.
2. Open **File Manager** (or connect via FileZilla FTP).
3. Open your website's **`htdocs/`** or **`public_html/`** folder.
4. Delete default index.php file if present.
5. Upload all files from your local **`dist/`** directory directly into **`htdocs/`**.

---

## Step 5: Verify Deployment

1. Visit your InfinityFree domain: `https://your-domain.infinityfreeapp.com`.
2. Open Browser DevTools (F12) -> Network tab.
3. Attempt to log in (`admin@salihport.local` / `AdminPassword123!`).
4. Verify HTTP requests target `https://salihport-demo.trycloudflare.com/api/auth/login` and return 200 OK status code.
