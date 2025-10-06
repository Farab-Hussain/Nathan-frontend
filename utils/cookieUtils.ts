// Utility function to clear all auth cookies
export const clearAuthCookies = () => {
  // Clear all possible auth cookie names
  const cookieNames = ['token', 'auth_token', 'jwt', 'accessToken'];
  
  cookieNames.forEach(name => {
    // Clear cookie for current domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    // Clear cookie for parent domain (production)
    if (window.location.hostname.includes('licorice4good.com')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=licorice4good.com;`;
    }
  });
};

// Utility function to check if cookies are expired
export const checkCookieExpiry = () => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
    
  if (!token) return true;
  
  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Check if token is too short (likely expired/invalid)
    if (token.length < 20) return true;
    
    return false;
  } catch {
    return true;
  }
};
