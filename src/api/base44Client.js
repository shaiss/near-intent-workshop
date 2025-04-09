import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "67f5a50cc00b5f54346480b6", 
  requiresAuth: false // Allow unauthenticated access initially
});
