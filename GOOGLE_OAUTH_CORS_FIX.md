# Google OAuth CORS Fix

## The Error
```
origins don't match "https://accounts.google.com" "http://localhost:3000"
```

This error means your Google OAuth Client ID is not configured to allow requests from `http://localhost:3000`.

## How to Fix

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if you don't have one)

### 2. Navigate to OAuth Settings
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID (the one ending in `...apps.googleusercontent.com`)
3. Click on it to edit

### 3. Add Authorized Origins
In the **Authorized JavaScript origins** section, add:
- `http://localhost:3000`
- `https://localhost:3000` (if you use HTTPS)

### 4. Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, add:
- `http://localhost:3000`
- `http://localhost:3000/sign-in`
- `http://localhost:3000/sign-up`

### 5. Save Changes
Click **Save** at the bottom

### 6. Wait for Propagation
It may take a few minutes for the changes to take effect.

## For Production
When you deploy to production, you'll need to add your production domain:
- `https://yourdomain.com`
- `https://yourdomain.com/sign-in`
- `https://yourdomain.com/sign-up`

## Test
After making these changes:
1. Wait 2-3 minutes for the changes to propagate
2. Refresh your browser
3. Try the Google OAuth button again

The error should be resolved!
