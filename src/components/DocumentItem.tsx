
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Edit, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchDocumentContent, editStory } from "@/services/googleService";
import { saveEditHistory, getDocumentHistory } from "@/services/historyService";
import { useAuth } from "@/context/AuthContext";
import { GoogleDocument, EditHistory } from "@/types";

interface DocumentItemProps {
  document: GoogleDocument;
}

const DocumentItem = ({ document }: DocumentItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<EditHistory[]>(
    getDocumentHistory(document.id)
  );

  const formattedDate = format(
    new Date(document.lastModified),
    "MMM d, yyyy 'at' h:mm a"
  );

  const handleEdit = async () => {
    if (!user?.accessToken) {
      toast({
        title: "Authentication Error",
        description: "Please log in to edit documents.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEditing(true);
      toast({
        title: "Processing Document",
        description: "Retrieving and editing your document...",
      });

      // Fetch the document content
      const content = await fetchDocumentContent(user.accessToken, document.id);
      
      // Process the content with our editing service
      const editedContent = await editStory(content);
      
      // Save to history
      const savedEntry = saveEditHistory(
        document.id,
        document.name,
        content,
        editedContent
      );
      
      // Update local history state
      setHistory([savedEntry, ...history]);
      
      toast({
        title: "Editing Complete",
        description: "Your document has been successfully edited!",
      });
      
      // Navigate to the result page
      navigate(`/history/${savedEntry.id}`);
    } catch (error) {
      console.error("Error editing document:", error);
      toast({
        title: "Editing Failed",
        description: "There was a problem editing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const viewHistory = () => {
    navigate(`/document/${document.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{document.name}</CardTitle>
          <a 
            href={document.webViewLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formattedDate}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {history.length > 0 && (
          <Badge variant="outline" className="bg-spark-purple/10 text-spark-purple">
            {history.length} edit{history.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={viewHistory}
          disabled={history.length === 0}
        >
          View History
        </Button>
        
        <Button 
          onClick={handleEdit} 
          disabled={isEditing}
          size="sm"
          className="bg-spark-purple hover:bg-spark-purple/90"
        >
          {isEditing ? "Editing..." : (
            <>
              <Edit className="h-4 w-4 mr-2" /> 
              Edit Story
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentItem;
