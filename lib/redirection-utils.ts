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
    fallbackMethods = ['replace', 'location', 'router']
  } = options;

  console.log(`Starting robust redirect to ${target} with ${maxAttempts} attempts`);

  // Wait for any pending state updates and ensure cookies are set
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Verify we're not already on the target page
  if (typeof window !== 'undefined' && window.location.pathname === target) {
    console.log(`Already on target page ${target}`);
    return;
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Redirection attempt ${attempt}/${maxAttempts}`);

    try {
      // Try each fallback method in order - use replace first for most reliable redirect
      for (const method of fallbackMethods) {
        try {
          switch (method) {
            case 'replace':
              // Use replace first as it's most reliable and doesn't add to history
              console.log(`Attempting window.location.replace to ${target}`);
              window.location.replace(target);
              // Give it a moment to start navigation
              await new Promise(resolve => setTimeout(resolve, 100));
              console.log('window.location.replace initiated');
              return;

            case 'location':
              console.log(`Attempting window.location.href to ${target}`);
              window.location.href = target;
              // Give it a moment to start navigation
              await new Promise(resolve => setTimeout(resolve, 100));
              console.log('window.location.href set successfully');
              return;

            case 'router':
              if (router && typeof router.push === 'function') {
                console.log(`Attempting router.push to ${target}`);
                // Use router.push as last resort since it's less reliable
                router.push(target);
                // Wait a bit and check if navigation happened
                await new Promise(resolve => setTimeout(resolve, 500));
                if (typeof window !== 'undefined' && window.location.pathname === target) {
                  console.log('Router.push successful - navigation confirmed');
                  return;
                } else {
                  console.warn('Router.push did not navigate, trying next method');
                  throw new Error('Router.push did not navigate');
                }
              }
              break;
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

  // If all attempts failed, use force redirect as last resort
  console.warn('All redirect methods failed, using force redirect');
  forceRedirect(target);
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
