export interface Chapter {
  id: string;
  title: string;
  content?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface EBook {
  topic: string;
  title: string;
  targetAudience: string;
  description: string;
  chapters: Chapter[];
  coverImage?: string;
  coverStyle?: string;
  tone?: string;
  authorBio?: string;
}

export enum AgentRole {
  STRATEGIST = 'นักวางกลยุทธ์',
  WRITER = 'นักเขียน',
  DESIGNER = 'นักออกแบบ',
  REVIEWER = 'บรรณาธิการ'
}

export interface LogEntry {
  timestamp: Date;
  agent: AgentRole;
  message: string;
}

export enum WorkflowStep {
  INPUT = 0,
  OUTLINE = 1,
  APPROVAL = 2, // New step: Review Outline before writing
  WRITING = 3,
  DESIGN = 4,
  REVIEW = 5,
  COMPLETED = 6
}