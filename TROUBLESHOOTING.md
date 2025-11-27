# Troubleshooting Blank White Screen

## Issue
Seeing a blank white screen or unstyled HTML for 1 second before blank screen.

## Solutions

### 1. Restart Development Server
The most common fix - Tailwind CSS needs to process the styles:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd Frontend
npm run dev
```

### 2. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 3. Check Console for Errors
Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if CSS files are loading (index.css, App.css)

### 4. Verify Tailwind Installation
```bash
cd Frontend
npm list tailwindcss postcss autoprefixer
```

If not installed:
```bash
npm install tailwindcss postcss autoprefixer
```

### 5. Check File Structure
Ensure these files exist:
- `Frontend/tailwind.config.js`
- `Frontend/postcss.config.js`
- `Frontend/src/index.css` (with @tailwind directives)

### 6. Verify Vite Configuration
Check `Frontend/vite.config.js` - should have React plugin:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 7. Common Issues Fixed

✅ **Fixed**: `border-border` invalid class → changed to `border-dark-700`
✅ **Fixed**: Duplicate body styles → consolidated in @layer base
✅ **Fixed**: Missing error handling in StarBackground → added try-catch
✅ **Fixed**: Missing spinner animation → added to App.css

### 8. If Still Not Working

1. **Delete node_modules and reinstall**:
   ```bash
   cd Frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check if backend is running**:
   ```bash
   cd Backend
   npm run dev
   ```
   Should see: "Server is Running on 3000"

3. **Check API connection**:
   - Open browser DevTools → Network tab
   - Look for failed requests to `http://localhost:3000`

### 9. Quick Test
Create a simple test to verify React is working:

Temporarily replace `App.jsx` content with:
```jsx
function App() {
  return <div style={{padding: '20px', color: 'white', background: '#0a0e1a'}}>
    <h1>React is working!</h1>
  </div>
}
export default App;
```

If this shows, React is fine - issue is with Tailwind/CSS.
If this doesn't show, there's a JavaScript error.

### 10. Check Browser Compatibility
- Use Chrome, Firefox, or Edge (latest versions)
- Disable browser extensions that might interfere

## Expected Behavior
After fixes:
1. Dark background should appear immediately
2. Login page with glass morphism card
3. Animated star background
4. No white screen flash

## Still Having Issues?
Check:
- Node.js version (should be 14+)
- npm version (should be 6+)
- All dependencies installed correctly
- No port conflicts (3000 for backend, 5173 for frontend)

