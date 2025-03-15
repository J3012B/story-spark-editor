
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Clock, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getHistoryById } from "@/services/historyService";
import { useAuth } from "@/context/AuthContext";
import { EditHistory } from "@/types";

const HistoryDetail = () => {
  const { historyId } = useParams<{ historyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<EditHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!historyId) {
      navigate("/documents");
      return;
    }
    
    loadHistory();
  }, [historyId, user, navigate]);
  
  const loadHistory = () => {
    if (!historyId) return;
    
    setIsLoading(true);
    
    try {
      const historyEntry = getHistoryById(historyId);
      
      if (historyEntry) {
        setHistory(historyEntry);
      } else {
        navigate("/documents");
      }
    } catch (error) {
      console.error("Error loading history:", error);
      navigate("/documents");
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadAsTextFile = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleDownloadEdited = () => {
    if (!history) return;
    
    const timestamp = format(new Date(history.timestamp), "yyyy-MM-dd_HH-mm");
    const filename = `${history.documentName}_edited_${timestamp}.txt`;
    
    downloadAsTextFile(history.editedContent, filename);
  };
  
  const handleDownloadOriginal = () => {
    if (!history?.originalContent) return;
    
    const timestamp = format(new Date(history.timestamp), "yyyy-MM-dd_HH-mm");
    const filename = `${history.documentName}_original_${timestamp}.txt`;
    
    downloadAsTextFile(history.originalContent, filename);
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4"></div>
        <div className="h-8 w-64 bg-muted rounded mb-8"></div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    );
  }
  
  if (!history) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Edit Not Found</h1>
        <p className="mb-4">We couldn't find this edit in your history.</p>
        <Button asChild variant="outline">
          <Link to="/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Link>
        </Button>
      </div>
    );
  }
  
  const formattedDate = format(
    new Date(history.timestamp),
    "MMMM d, yyyy 'at' h:mm a"
  );
  
  return (
    <div className="container py-8 max-w-4xl">
      <Button 
        asChild 
        variant="outline" 
        className="mb-6"
      >
        <Link to={`/document/${history.documentId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Link>
      </Button>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{history.documentName}</CardTitle>
          <CardDescription className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Edited on {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <a 
            href={`https://docs.google.com/document/d/${history.documentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-spark-purple hover:text-spark-purple/80 flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open original document
          </a>
          
          <div className="flex gap-2">
            {history.originalContent && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadOriginal}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Original
              </Button>
            )}
            <Button 
              size="sm"
              onClick={handleDownloadEdited}
              className="bg-spark-purple hover:bg-spark-purple/90 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Edited
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="original" disabled={!history.originalContent}>
            Original
          </TabsTrigger>
          <TabsTrigger value="edited">Edited</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.originalContent ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Original Document</CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-auto whitespace-pre-wrap">
                  {history.originalContent}
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center p-4">
                <p className="text-muted-foreground">Original content not available</p>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Edited Document</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-auto whitespace-pre-wrap">
                {history.editedContent}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="original" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Original Document</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-auto whitespace-pre-wrap">
              {history.originalContent || "Original content not available"}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edited" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Edited Document</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-auto whitespace-pre-wrap">
              {history.editedContent}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryDetail;
