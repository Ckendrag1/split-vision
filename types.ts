
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: { name: string; weight: number }[]; // Changed from string[] to object with weight
}

export interface ReceiptData {
  items: {
    name: string;
    price: number;
  }[];
  tax: number;
  total: number;
}

export interface Person {
  name: string;
  subtotal: number;
  totalOwed: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  alerts?: string[];
}

export interface ReceiptSession {
  id: string;
  date: string;
  items: ReceiptItem[];
  tax: number;
  total: number;
  tip: number;
  messages: ChatMessage[];
}

export interface AssignmentResult {
  assignments: { 
    itemId: string; 
    persons: { name: string; weight: number }[]; // Enhanced to include weights/shares
    action?: 'highlight' | 'pulse' | 'check';
  }[];
  unassigned_items: string[];
  reconciliation_alerts: string[];
}
