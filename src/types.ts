export type PriorityType = "none" | "low" | "medium" | "high";

export enum Priority {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export class Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  created_at: string;
  updated_at: string;

  constructor(title: string, priority: Priority = Priority.NONE) {
    this.id = 0;
    this.title = title;
    this.completed = false;
    this.priority = priority;
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }
}
