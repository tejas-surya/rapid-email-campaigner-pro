
// Type definitions for Chrome extension APIs
interface Chrome {
  identity: {
    getRedirectURL: () => string;
    launchWebAuthFlow: (
      options: {
        url: string;
        interactive: boolean;
      },
      callback: (responseUrl?: string) => void
    ) => void;
  };
  runtime: {
    lastError?: {
      message: string;
    };
  };
}

declare var chrome: Chrome;
