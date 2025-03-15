
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { GoogleUser } from "@/types";

interface AuthContextType {
  user: GoogleUser | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if the user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('storySparkUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('storySparkUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Load the Google API script
  useEffect(() => {
    const loadGoogleApi = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    };
    
    return loadGoogleApi();
  }, []);

  const login = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google) {
          toast({
            title: "Error",
            description: "Google API not loaded yet. Please try again.",
            variant: "destructive"
          });
          reject(new Error("Google API not loaded"));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: '282404150033-4pps8dvatbv4k9m5k0qlu9euj7chr9rr.apps.googleusercontent.com', // This is a placeholder - user will need to replace with their own
          scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly profile email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              toast({
                title: "Authentication Error",
                description: tokenResponse.error,
                variant: "destructive"
              });
              reject(new Error(tokenResponse.error));
              return;
            }

            try {
              // Get user profile
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`
                }
              });
              
              if (!userInfoResponse.ok) {
                throw new Error('Failed to fetch user info');
              }
              
              const userInfo = await userInfoResponse.json();
              
              const userData: GoogleUser = {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                accessToken: tokenResponse.access_token
              };
              
              setUser(userData);
              localStorage.setItem('storySparkUser', JSON.stringify(userData));
              
              toast({
                title: "Authentication Successful",
                description: `Welcome back, ${userData.name}!`,
              });
              
              resolve();
            } catch (error) {
              console.error('Error fetching user info:', error);
              toast({
                title: "Error",
                description: "Failed to get user information.",
                variant: "destructive"
              });
              reject(error);
            }
          }
        });

        client.requestAccessToken();
      } catch (error) {
        console.error('Login error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize Google login.",
          variant: "destructive"
        });
        reject(error);
      }
    });
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear local storage
      localStorage.removeItem('storySparkUser');
      
      // Reset state
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Revoke Google token - optional but good practice
      if (user?.accessToken) {
        const revokeEndpoint = `https://oauth2.googleapis.com/revoke?token=${user.accessToken}`;
        await fetch(revokeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "There was a problem logging out.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
