
/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: any) => {
          requestAccessToken: () => void;
        };
      };
    };
  };
}
