
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchDocuments } from "@/services/googleService";
import DocumentItem from "@/components/DocumentItem";
import { GoogleDocument } from "@/types";

const DocumentsList = () => {
  const [documents, setDocuments] = useState<GoogleDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    loadDocuments();
  }, [user, navigate]);
  
  const loadDocuments = async () => {
    if (!user?.accessToken) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const docs = await fetchDocuments(user.accessToken);
      setDocuments(docs);
      if (docs.length === 0) {
        toast({
          title: "No documents found",
          description: "We couldn't find any Google Docs in your account.",
        });
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load your documents. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch your documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    loadDocuments();
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Documents</h1>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No documents found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any Google Docs in your account.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
            <a
              href="https://docs.google.com/document/create"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>Create a New Doc</Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentItem key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
