# Hybrid Authentication System

This project implements a hybrid authentication system that supports both **Google OAuth** and **email-based authentication** through a hosted backend.

## Features

### 🔐 Dual Authentication Methods
- **Google OAuth**: Uses Better Auth for seamless Google sign-in
- **Email/Password**: Connects to hosted backend at `https://pinecrest.up.railway.app`
 
### 🚀 Authentication Flow

#### Google OAuth
1. User clicks "Sign in with Google"
2. Better Auth handles OAuth flow
3. User data is stored locally with a special `google_` token prefix
4. User is redirected to dashboard

#### Email Authentication
1. User enters email and password
2. Credentials are sent to backend API
3. Backend validates and returns JWT token
4. Token is stored locally and user is redirected to dashboard

### 📁 File Structure

```
frontend/
├── lib/
│   ├── auth-service.ts          # Hybrid authentication service
│   └── auth-client.ts           # Better Auth client (Google OAuth)
├── app/
│   ├── sign-in/page.tsx         # Sign in page (both methods)
│   ├── sign-up/page.tsx         # Sign up page (both methods)
│   ├── forgot-password/page.tsx # Password reset request
│   ├── reset-password/page.tsx  # Password reset with token
│   └── dashboard/page.tsx       # Protected dashboard
```

## API Endpoints

The authentication service connects to these backend endpoints:

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `PUT /api/users/change-password` - Change password (requires auth)

## Usage

### Basic Authentication Check
```typescript
import { authService } from "@/lib/auth-service";

// Check if user is authenticated
if (authService.isAuthenticated()) {
  // User is logged in
  const user = authService.getUser();
  const token = authService.getToken();
}
```

### User Type Detection
```typescript
// Check authentication method
if (authService.isGoogleUser()) {
  // User signed in with Google OAuth
} else if (authService.isEmailUser()) {
  // User signed in with email/password
}
```

### Logout
```typescript
// Logout works for both authentication methods
authService.logout();
```

## Security Features

### Token Management
- JWT tokens for email authentication
- Special prefix tokens for Google OAuth
- Automatic token storage in localStorage
- Token validation and expiration handling

### Password Security
- Minimum 6 character requirement
- Password confirmation validation
- Secure password reset flow
- Backend password hashing (bcrypt)

## Backend Integration

The hosted backend (`https://pinecrest.up.railway.app`) provides:

- User registration and login
- JWT token generation and validation
- Password reset functionality
- User profile management
- Secure password storage with bcrypt

## Development Notes

### Environment Variables
```bash
# Backend API URL (optional, defaults to hosted backend)
NEXT_PUBLIC_API_URL=https://pinecrest.up.railway.app
```

### Testing
- Test both Google OAuth and email authentication flows
- Verify password reset functionality
- Check token persistence across page reloads
- Test logout functionality

### Error Handling
- Network errors are caught and displayed to users
- Validation errors from backend are shown
- Graceful fallbacks for authentication failures

## Future Enhancements

- [ ] Phone number authentication support
- [ ] Two-factor authentication
- [ ] Social login integration (Facebook, Twitter)
- [ ] Account linking (connect Google to existing email account)
- [ ] Session management and refresh tokens
- [ ] Offline authentication support
