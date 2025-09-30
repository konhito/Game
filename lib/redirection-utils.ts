/**
 * Utility functions for handling redirections with multiple fallback mechanisms
 */

export interface RedirectionOptions {
  target: string;
  delay?: number;
  maxAttempts?: number;
  fallbackMethods?: ('router' | 'location' | 'replace')[];
}

/**
 * Robust redirection with multiple fallback mechanisms
 */
export async function robustRedirect(
  router: any,
  options: RedirectionOptions
): Promise<void> {
  const {
    target,
    delay = 500,
    maxAttempts = 3,
    fallbackMethods = ['router', 'location', 'replace']
  } = options;

  console.log(`Starting robust redirect to ${target} with ${maxAttempts} attempts`);

  // Wait for any pending state updates
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Redirection attempt ${attempt}/${maxAttempts}`);

    try {
      // Try each fallback method in order
      for (const method of fallbackMethods) {
        try {
          switch (method) {
            case 'router':
              if (router && typeof router.push === 'function') {
                console.log(`Attempting router.push to ${target}`);
                await router.push(target);
                console.log('Router.push successful');
                return;
              }
              break;

            case 'location':
              console.log(`Attempting window.location.href to ${target}`);
              window.location.href = target;
              console.log('window.location.href set successfully');
              return;

            case 'replace':
              console.log(`Attempting window.location.replace to ${target}`);
              window.location.replace(target);
              console.log('window.location.replace successful');
              return;
          }
        } catch (methodError) {
          console.error(`Method ${method} failed:`, methodError);
          lastError = methodError as Error;
        }
      }

      // If all methods failed, wait before retry
      if (attempt < maxAttempts) {
        console.log(`All methods failed on attempt ${attempt}, waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error as Error;
    }
  }

  // If all attempts failed, throw the last error
  throw new Error(`Failed to redirect to ${target} after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
}

/**
 * Check if we're still on the current page after a delay
 */
export function checkPageAfterDelay(
  currentPath: string,
  delay: number = 2000
): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stillOnPage = window.location.pathname === currentPath;
      console.log(`Page check after ${delay}ms: still on ${currentPath} = ${stillOnPage}`);
      resolve(stillOnPage);
    }, delay);
  });
}

/**
 * Force redirect using the most reliable method
 */
export function forceRedirect(target: string): void {
  console.log(`Force redirecting to ${target}`);
  
  try {
    // Try window.location.replace first (most reliable)
    window.location.replace(target);
  } catch (error) {
    console.error('window.location.replace failed, trying window.location.href:', error);
    try {
      window.location.href = target;
    } catch (hrefError) {
      console.error('window.location.href also failed:', hrefError);
      // Last resort: reload the page with the target URL
      window.location.reload();
    }
  }
}

/**
 * Verify authentication state before redirection
 */
export function verifyAuthState(authService: any): boolean {
  try {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();
    const token = authService.getToken();

    console.log('Auth state verification:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      userEmail: user?.email
    });

    return isAuthenticated && !!user && !!token;
  } catch (error) {
    console.error('Error verifying auth state:', error);
    return false;
  }
}
