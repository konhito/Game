/**
 * Utility functions for JWT token validation
 */

/**
 * Decode JWT token without verification (to check expiration)
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJWT(token: string): any | null {
  try {
    // JWT tokens have 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(atob(paddedPayload));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  // Google OAuth fallback tokens don't have expiration
  if (token.startsWith('google_')) {
    return false; // We can't check expiration for these
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return true;
    }

    // Check if token has expiration claim
    if (!decoded.exp) {
      // If no expiration claim, consider it valid (but this shouldn't happen with proper JWT)
      return false;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Add 5 minute buffer to account for clock skew
    const buffer = 5 * 60 * 1000; // 5 minutes in milliseconds

    return currentTime >= (expirationTime - buffer);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't check, consider it expired for safety
  }
}

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns Expiration date or null if invalid
 */
export function getTokenExpiration(token: string | null): Date | null {
  if (!token || token.startsWith('google_')) {
    return null;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}
