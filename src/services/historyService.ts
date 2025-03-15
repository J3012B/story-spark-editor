
import { EditHistory } from "@/types";

const HISTORY_STORAGE_KEY = 'storySparkEditHistory';

export const saveEditHistory = (
  documentId: string,
  documentName: string,
  originalContent: string | undefined,
  editedContent: string
): EditHistory => {
  // Get existing history
  const existingHistory = getEditHistory();
  
  // Create new history entry
  const newEntry: EditHistory = {
    id: crypto.randomUUID(),
    documentId,
    documentName,
    timestamp: new Date().toISOString(),
    originalContent,
    editedContent
  };
  
  // Add new entry to history
  const updatedHistory = [newEntry, ...existingHistory];
  
  // Save updated history
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  
  return newEntry;
};

export const getEditHistory = (): EditHistory[] => {
  const historyString = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!historyString) return [];
  
  try {
    return JSON.parse(historyString);
  } catch (error) {
    console.error('Error parsing edit history:', error);
    return [];
  }
};

export const getDocumentHistory = (documentId: string): EditHistory[] => {
  const allHistory = getEditHistory();
  return allHistory.filter(entry => entry.documentId === documentId);
};

export const getHistoryById = (historyId: string): EditHistory | undefined => {
  const allHistory = getEditHistory();
  return allHistory.find(entry => entry.id === historyId);
};
