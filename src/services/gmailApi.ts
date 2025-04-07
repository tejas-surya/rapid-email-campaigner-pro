
// Gmail API service for sending emails
import { toast } from "@/components/ui/use-toast";

// Define the Gmail API response structure
interface GmailApiResponse {
  success: boolean;
  error?: string;
  threadId?: string;
}

// Authentication token storage
let accessToken: string | null = null;

// Store the access token
export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem('gmail_access_token', token);
};

// Get the stored access token
export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('gmail_access_token');
  }
  return accessToken;
};

// Clear the access token (for logout)
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('gmail_access_token');
};

// Check if we have a valid token
export const hasValidToken = (): boolean => {
  return !!getAccessToken();
};

// Function to authorize with Gmail
export const authorizeWithGmail = () => {
  // Define OAuth 2.0 parameters
  const clientId = "YOUR_GOOGLE_CLOUD_CLIENT_ID"; // You need to replace this with your client ID
  const redirectUri = `${window.location.origin}/oauth-callback`;
  const scope = "https://www.googleapis.com/auth/gmail.send";
  
  // Build the OAuth URL
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
  
  // For development/browser environment
  window.open(authUrl, "_blank", "width=600,height=700");
  
  // Listen for the OAuth callback
  window.addEventListener("message", (event) => {
    if (event.data.type === "oauth-response" && event.data.accessToken) {
      setAccessToken(event.data.accessToken);
      toast({
        title: "Authentication Success",
        description: "Successfully connected to Gmail!",
      });
    }
  });
};

// Helper to convert a string to base64url format
const base64url = (str: string): string => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Construct a MIME message
const constructMimeMessage = (
  to: string,
  subject: string,
  body: string,
  from: string,
  attachments: File[] = []
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create the email headers
    const headers = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
    ];

    // Generate a boundary for multipart message
    const boundary = `boundary_${Date.now().toString(16)}`;
    headers.push('MIME-Version: 1.0');
    headers.push(`Content-Type: multipart/mixed; boundary=${boundary}`);
    
    // Start building the MIME message
    let email = headers.join('\r\n') + '\r\n\r\n';
    
    // Add the text part
    email += `--${boundary}\r\n`;
    email += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
    email += body + '\r\n\r\n';

    // Handle attachments if any
    if (attachments.length === 0) {
      email += `--${boundary}--`;
      resolve(base64url(email));
      return;
    }

    // Process attachments one by one
    let processedAttachments = 0;
    
    attachments.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const fileContent = reader.result as string;
        // Get the base64 part (after the comma)
        const base64Data = fileContent.split(',')[1];
        
        email += `--${boundary}\r\n`;
        email += `Content-Type: ${file.type}\r\n`;
        email += 'Content-Transfer-Encoding: base64\r\n';
        email += `Content-Disposition: attachment; filename="${file.name}"\r\n\r\n`;
        email += base64Data.replace(/(.{76})/g, '$1\r\n') + '\r\n\r\n';
        
        processedAttachments++;
        
        if (processedAttachments === attachments.length) {
          email += `--${boundary}--`;
          resolve(base64url(email));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read attachment: ${file.name}`));
      };
      
      reader.readAsDataURL(file);
    });
  });
};

// Function to send an email to multiple recipients (up to 500) in one message
export const sendBulkEmail = async (
  recipients: string[],
  subject: string,
  body: string,
  from: string,
  attachments: File[] = []
): Promise<GmailApiResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    return {
      success: false,
      error: "Not authenticated. Please connect your Gmail account."
    };
  }
  
  // Gmail allows up to 500 recipients per email
  const maxRecipientsPerEmail = 500;
  
  if (recipients.length > maxRecipientsPerEmail) {
    return {
      success: false,
      error: `Too many recipients. Gmail allows maximum ${maxRecipientsPerEmail} recipients per email.`
    };
  }
  
  try {
    // Combine all recipients in a comma-separated string
    const toField = recipients.join(', ');
    
    // Construct the email MIME message
    const mimeMessage = await constructMimeMessage(toField, subject, body, from, attachments);
    
    // Send the email using Gmail API
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: mimeMessage
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || "Failed to send email"
      };
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      threadId: responseData.threadId
    };
  } catch (error) {
    console.error("Error sending bulk email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Send an email using Gmail API (to a single recipient)
export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  from: string,
  attachments: File[] = []
): Promise<GmailApiResponse> => {
  const token = getAccessToken();
  
  if (!token) {
    return {
      success: false,
      error: "Not authenticated. Please connect your Gmail account."
    };
  }
  
  try {
    // Construct the email MIME message
    const mimeMessage = await constructMimeMessage(to, subject, body, from, attachments);
    
    // Send the email using Gmail API
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: mimeMessage
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || "Failed to send email"
      };
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      threadId: responseData.threadId
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
