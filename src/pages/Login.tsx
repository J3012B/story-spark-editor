
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/documents");
    }
  }, [user, navigate]);
  
  const handleLogin = async () => {
    try {
      await login();
      navigate("/documents");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className="h-10 w-10 text-spark-purple mb-4 animate-bounce-slow" />
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-spark-purple/10 to-spark-teal/10">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-spark-purple/10">
                <Sparkles className="h-10 w-10 text-spark-purple animate-bounce-slow" />
              </div>
            </div>
            <CardTitle className="text-2xl">Story Spark Editor</CardTitle>
            <CardDescription>
              Turn children's stories into polished prose while preserving their unique voice
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Sign in with your Google account to access and edit your documents
            </p>
            
            <div className="bg-spark-purple/5 p-4 rounded-lg">
              <ul className="text-left space-y-2">
                <li className="flex items-start">
                  <span className="text-spark-purple mr-2 font-bold">•</span>
                  <span>Access your Google Docs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-spark-purple mr-2 font-bold">•</span>
                  <span>Auto-edit children's stories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-spark-purple mr-2 font-bold">•</span>
                  <span>Track all editing history</span>
                </li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full bg-spark-purple hover:bg-spark-purple/90" 
              size="lg"
              onClick={handleLogin}
            >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
