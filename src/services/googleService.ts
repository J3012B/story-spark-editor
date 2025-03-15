
import { GoogleDocument } from "@/types";

const GOOGLE_API_BASE = 'https://www.googleapis.com';

export const fetchDocuments = async (accessToken: string): Promise<GoogleDocument[]> => {
  try {
    // Fetch only Google Docs (not folders, sheets, etc)
    const queryParams = new URLSearchParams({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: "files(id,name,modifiedTime,webViewLink,iconLink)",
      orderBy: "modifiedTime desc"
    });

    const response = await fetch(
      `${GOOGLE_API_BASE}/drive/v3/files?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      lastModified: file.modifiedTime,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink
    }));
  } catch (error) {
    console.error("Error fetching Google documents:", error);
    throw error;
  }
};

export const fetchDocumentContent = async (accessToken: string, documentId: string): Promise<string> => {
  try {
    const response = await fetch(
      `${GOOGLE_API_BASE}/docs/v1/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch document content: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text content from the Google Docs format
    let content = '';
    if (data.body && data.body.content) {
      data.body.content.forEach((item: any) => {
        if (item.paragraph) {
          item.paragraph.elements.forEach((element: any) => {
            if (element.textRun) {
              content += element.textRun.content;
            }
          });
        }
      });
    }
    
    return content;
  } catch (error) {
    console.error("Error fetching document content:", error);
    throw error;
  }
};

// Simulate the editing process with AI (this would be replaced with a real API call)
export const editStory = async (content: string): Promise<string> => {
  try {
    // In a real app, this would be an API call to an AI service
    // For now, we'll just simulate some basic editing
    
    // Wait a bit to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Make some simple edits
    let editedContent = content
      // Fix common punctuation issues
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/([.,!?;:])\s*([A-Za-z])/g, '$1 $2')
      // Capitalize the first letter of sentences
      .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
      // Fix double spaces
      .replace(/\s{2,}/g, ' ')
      // Add some "improvements" to demonstrate the editing
      .replace(/very/gi, 'incredibly')
      .replace(/nice/gi, 'delightful')
      .replace(/good/gi, 'excellent')
      .replace(/bad/gi, 'unfortunate')
      .replace(/big/gi, 'enormous')
      .replace(/small/gi, 'tiny')
      .replace(/went/gi, 'journeyed')
      .replace(/saw/gi, 'observed')
      .replace(/said/gi, 'exclaimed');
    
    return editedContent;
  } catch (error) {
    console.error("Error editing story:", error);
    throw error;
  }
};
