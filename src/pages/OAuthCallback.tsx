
import React, { useEffect } from 'react';
import { setAccessToken } from '@/services/gmailApi';

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    // Parse the hash fragment to get the access token
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      // Store the token
      setAccessToken(accessToken);
      
      // Send a message to the opener window
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-response',
          accessToken
        }, window.location.origin);
        
        // Close this window
        window.close();
      } else {
        // If no opener, redirect to the main app
        window.location.href = '/';
      }
    } else {
      // Handle error
      console.error('No access token found in the callback URL');
    }
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-xl font-bold mb-4">Processing Authentication...</h1>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
