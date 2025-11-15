# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the PineCoin application.

## Prerequisites

1. A Google Cloud Platform account
2. Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "PineCoin App")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and then click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "PineCoin"
     - User support email: your email
     - Developer contact information: your email
   - Add your domain to authorized domains
   - Save and continue through the scopes and test users sections

4. For the OAuth client:
   - Application type: "Web application"
   - Name: "PineCoin Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)

5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in the frontend directory with the following content:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Backend API
NEXT_PUBLIC_API_BASE=https://pinecrest.up.railway.app

# App Configuration
NEXT_PUBLIC_APP_NAME=PineCoin
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace `your-google-client-id-here` and `your-google-client-secret-here` with the actual values from Step 3.

## Step 5: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/sign-in`
3. Click the "Sign in with Google" button
4. Complete the Google OAuth flow
5. Verify that you're redirected to the dashboard

## Troubleshooting

### Common Issues

1. **"Google OAuth not configured" error**
   - Make sure you've set the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable
   - Restart the development server after adding environment variables

2. **"This app isn't verified" warning**
   - This is normal for development. Click "Advanced" and then "Go to PineCoin (unsafe)"
   - For production, you'll need to verify your app with Google

3. **CORS errors**
   - Make sure your domain is added to "Authorized JavaScript origins" in the Google Cloud Console
   - Check that the URL matches exactly (including http vs https)

4. **Redirect URI mismatch**
   - Ensure the redirect URI in Google Cloud Console matches your app URL exactly
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`

### Development vs Production

- **Development**: Use `http://localhost:3000` in all Google Cloud Console settings
- **Production**: Replace with your actual domain (e.g., `https://pinecoin.com`)

## Security Notes

1. Never commit the `.env.local` file to version control
2. The `GOOGLE_CLIENT_SECRET` should only be used on the server side
3. The `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is safe to expose in the client-side code
4. Always use HTTPS in production

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Best Practices](https://developers.google.com/identity/protocols/oauth2/web-best-practices)
- [Google Cloud Console](https://console.cloud.google.com/)
