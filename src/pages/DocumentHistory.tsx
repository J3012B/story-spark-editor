
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchDocumentContent } from "@/services/googleService";
import { getDocumentHistory } from "@/services/historyService";
import { useAuth } from "@/context/AuthContext";
import { EditHistory, GoogleDocument } from "@/types";

const DocumentHistory = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [document, setDocument] = useState<GoogleDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!documentId) {
      navigate("/documents");
      return;
    }
    
    loadHistory();
  }, [documentId, user, navigate]);
  
  const loadHistory = async () => {
    if (!documentId) return;
    
    setIsLoading(true);
    
    try {
      // Get document history from local storage
      const docHistory = getDocumentHistory(documentId);
      setHistory(docHistory);
      
      if (docHistory.length > 0) {
        // Use the first history item to get document details
        setDocument({
          id: documentId,
          name: docHistory[0].documentName,
          lastModified: docHistory[0].timestamp,
          webViewLink: `https://docs.google.com/document/d/${documentId}`,
          iconLink: '',
        });
      } else if (user?.accessToken) {
        // If no history but user is logged in, try to get document details from Google
        try {
          await fetchDocumentContent(user.accessToken, documentId);
          // If successful, set basic document info
          setDocument({
            id: documentId,
            name: "Document", // Generic name since we don't have it
            lastModified: new Date().toISOString(),
            webViewLink: `https://docs.google.com/document/d/${documentId}`,
            iconLink: '',
          });
        } catch (error) {
          console.error("Error fetching document:", error);
          navigate("/documents");
        }
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4"></div>
        <div className="h-8 w-64 bg-muted rounded mb-8"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
        <p className="mb-4">We couldn't find this document in your history.</p>
        <Button asChild variant="outline">
          <Link to="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <Button 
        asChild 
        variant="outline" 
        className="mb-6"
      >
        <Link to="/documents">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{document.name}</h1>
        <p className="text-muted-foreground">
          Editing history for this document
        </p>
      </div>
      
      {history.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">No Edit History</CardTitle>
            <CardDescription>
              This document hasn't been edited yet using Story Spark.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center mb-8">
              Try editing this document to see its history here.
            </p>
            <Button asChild>
              <Link to="/documents">
                Go Back to Documents
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <CardTitle className="text-base font-medium">
                    <Clock className="inline-block h-4 w-4 mr-2" />
                    {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </CardTitle>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="text-spark-purple hover:text-spark-purple/80 hover:bg-spark-purple/10"
                  >
                    <Link to={`/history/${entry.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
                <Separator className="mt-2" />
              </CardHeader>
              <CardContent className="pb-3">
                <p className="line-clamp-3 text-sm">
                  {entry.editedContent?.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentHistory;
