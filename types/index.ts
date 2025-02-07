export interface Task {
    id: number
    title: string
    description?: string
    userId: number
    projectId?: number
    priority: "low" | "medium" | "high"
    dueDate?: string
    completed: boolean
    createdAt: string
  }
  
  export interface Project {
    id: number
    name: string
    description?: string
    userId: number
    createdAt: string
  }
  
  