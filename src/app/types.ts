export type ReportStatus = 
  | "not-started" 
  | "in-progress" 
  | "completed" 
  | "sent" 
  | "confirmed" 
  | "meeting-scheduled";

export type Situation = 
  | "approved" 
  | "in-progress" 
  | "needs-attention" 
  | "failed";

export type CEFRLevel = 
  | "A1" 
  | "A1+" 
  | "A2" 
  | "A2+" 
  | "B1" 
  | "B1+" 
  | "B2" 
  | "B2+" 
  | "C1" 
  | "C2";

export type ClassType = "regular" | "intensive" | "private";

export interface Student {
  id: string;
  name: string;
  class: string;
  classType: ClassType;
  status: ReportStatus;
}

export interface Competency {
  id: string;
  name: string;
  rating: number; // 1-5
  whatISee: string;
  whyItMatters: string;
  whatToDo: string;
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  classType: ClassType;
  period: string;
  evaluation: "1 de 2 ciclos" | "2 de 2 ciclos";
  professorName: string;
  coordinatorName: string;
  
  // Quantitative data
  attendance: number; // 0-100
  testScore: number; // 0-100
  situation: Situation;
  cefrLevel: CEFRLevel;
  
  // Competencies
  competencies: Competency[];
  
  // Final observations
  professorVoice: string;
  cycleFocus: string;
  technicalFocus?: string; // Only for evaluation 2
  engagementHours?: string; // Only for evaluation 2
  observedHabits?: string[]; // Only for evaluation 2
  
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  confirmedAt?: Date;
  meetingRequested?: boolean;
  meetingDateTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "professor" | "coordinator";
}
