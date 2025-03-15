
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/documents");
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center animate-fade-in">
        <div className="story-editor-gradient p-6 rounded-full mb-4">
          <Sparkles className="h-12 w-12 text-white animate-bounce-slow" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Story Spark Editor</h1>
        <p className="text-muted-foreground">Redirecting you to the right place...</p>
      </div>
    </div>
  );
};

export default Index;
