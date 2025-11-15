# Instagram OAuth Setup Guide

This guide will help you set up Instagram OAuth authentication for the PineCoin application using Facebook's OAuth system.

## Overview

Instagram login uses Facebook's OAuth system since Instagram is owned by Meta (Facebook). The implementation uses the Facebook SDK to authenticate users with Instagram-connected accounts.

## Prerequisites

1. A Facebook Developer account
2. Access to the [Facebook Developers Console](https://developers.facebook.com/)

## Step 1: Create a Facebook App

1. Go to the [Facebook Developers Console](https://developers.facebook.com/)
2. Click "My Apps" and then "Create App"
3. Select "Consumer" as the app type
4. Fill in:
   - App Name: "PineCoin"
   - App Contact Email: your email
   - Business Account (optional): Leave blank if you don't have one
5. Click "Create App"

## Step 2: Add Facebook Login Product

1. In your app dashboard, go to "Add Products to Your App"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as the platform
4. Enter your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## Step 3: Configure OAuth Settings

1. Go to "Settings" > "Basic" in your app dashboard
2. Note your **App ID** and **App Secret** (you'll need these)
3. Scroll to "App Domains" and add:
   - `localhost` (for development)
   - `yourdomain.com` (for production)
4. Click "Add Platform" > "Website"
5. Enter your Site URL:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## Step 4: Configure Facebook Login Settings

1. Go to "Products" > "Facebook Login" > "Settings"
2. Under "Valid OAuth Redirect URIs", add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
3. Under "Deauthorize Callback URL", add the same URLs
4. Save changes

## Step 5: Request Permissions

The app requests the following permissions:
- `email` - User's email address
- `public_profile` - Basic profile information

Note: Instagram Basic Display API requires separate setup if you need Instagram-specific data (photos, posts, etc.). For basic login authentication, Facebook Login with Instagram-connected accounts works.

## Step 6: Configure Environment Variables

Create or update your `.env.local` file in the frontend directory:

```env
# Facebook/Instagram OAuth Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here

# Backend API
NEXT_PUBLIC_API_BASE=https://pinecrest.up.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=PineCoin
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace `your-facebook-app-id-here` with your actual Facebook App ID from Step 3.

## Step 7: Run Database Migration

The backend requires a database migration to add the `instagram_id` column:

```bash
cd backend
# Run the migration
psql -d your_database -f src/migrations/0022_add_instagram_auth.sql
```

Or if using Drizzle migrations:
```bash
cd backend
npm run db:migrate
```

## Step 8: Test the Integration

1. Start your development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the sign-in or sign-up page
3. Click "Continue with Instagram"
4. You should see a Facebook login popup (since Instagram uses Facebook OAuth)
5. Log in with an Instagram-connected Facebook account
6. Verify you're redirected to the dashboard after successful authentication

## Troubleshooting

### Facebook SDK Not Loading

- Check browser console for errors
- Verify `NEXT_PUBLIC_FACEBOOK_APP_ID` is set correctly
- Ensure Facebook SDK script is loading: Check Network tab for `sdk.js`

### Authentication Fails

- Verify App ID is correct in environment variables
- Check that redirect URIs match exactly in Facebook App settings
- Ensure app is not in "Development Mode" if testing with non-admin users
- Check backend logs for authentication errors

### Instagram-Specific Data Not Available

The current implementation uses Facebook Login, which provides basic profile data. For Instagram-specific features (photos, posts, etc.), you'll need to:

1. Set up Instagram Basic Display API separately
2. Request Instagram-specific permissions
3. Handle Instagram API responses differently

### App Review Required

For production use with public users:
1. Go to "App Review" in Facebook Developers Console
2. Request permissions you need (email, public_profile)
3. Submit your app for review
4. While in development, only app admins and test users can log in

## Development vs Production

### Development Mode
- Only admins and test users can log in
- No app review required
- Limited to registered test users

### Production Mode
- Requires app review for public access
- All users can log in (after approval)
- Must comply with Facebook Platform Policy

## Security Notes

- Never expose your App Secret in frontend code
- App Secret should only be used server-side if needed
- Use environment variables for all sensitive data
- Implement proper error handling for failed authentications
- Log authentication attempts for security monitoring

## Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Platform Policy](https://developers.facebook.com/policy)

## Summary

✅ Create Facebook App
✅ Add Facebook Login product
✅ Configure OAuth redirect URIs
✅ Add environment variables
✅ Run database migration
✅ Test authentication flow

The Instagram login is now integrated and ready to use!

