
export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

export interface GoogleDocument {
  id: string;
  name: string;
  lastModified: string;
  webViewLink: string;
  iconLink: string;
}

export interface EditHistory {
  id: string;
  documentId: string;
  documentName: string;
  timestamp: string;
  originalContent?: string;
  editedContent: string;
}
