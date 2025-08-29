import { authService } from "./auth-service";

// Compatibility layer for Better Auth interface
export const auth = {
  api: {
    getSession: async ({ headers }: { headers: any }) => {
      try {
        // Get the custom auth token from cookies
        const cookieHeader = headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/custom_auth_token=([^;]+)/);
        const userDataMatch = cookieHeader.match(/custom_user_data=([^;]+)/);
        
        if (tokenMatch && userDataMatch) {
          const token = decodeURIComponent(tokenMatch[1]);
          const userData = JSON.parse(decodeURIComponent(userDataMatch[1]));
          
          // Verify the token is still valid (you might want to add more validation here)
          if (token && userData) {
            return {
              session: {
                userId: userData.id,
                user: userData,
                accessToken: token
              }
            };
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error getting session:', error);
        return null;
      }
    }
  }
};
