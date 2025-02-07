import { create } from "zustand"
import type { Task, Project } from "@/types"

interface TaskState {
  tasks: Task[]
  projects: Project[]
  setTasks: (tasks: Task[]) => void
  setProjects: (projects: Project[]) => void
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>
  updateTask: (taskId: number, updatedTask: Partial<Task>) => Promise<void>
  deleteTask: (taskId: number) => Promise<void>
  addProject: (project: Omit<Project, "id" | "createdAt">) => Promise<void>
  updateProject: (projectId: number, updatedProject: Partial<Project>) => Promise<void>
  deleteProject: (projectId: number) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projects: [],
  setTasks: (tasks) => set({ tasks }),
  setProjects: (projects) => set({ projects }),
  addTask: async (task) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    })
    if (!response.ok) throw new Error("Failed to add task")
    const newTask = await response.json()
    set((state) => ({ tasks: [...state.tasks, newTask] }))
  },
  updateTask: async (taskId, updatedTask) => {
    const response = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, ...updatedTask }),
    })
    if (!response.ok) throw new Error("Failed to update task")
    const updated = await response.json()
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? updated : task)),
    }))
  },
  deleteTask: async (taskId) => {
    const response = await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId }),
    })
    if (!response.ok) throw new Error("Failed to delete task")
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }))
  },
  addProject: async (project) => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    })
    if (!response.ok) throw new Error("Failed to add project")
    const newProject = await response.json()
    set((state) => ({ projects: [...state.projects, newProject] }))
  },
  updateProject: async (projectId, updatedProject) => {
    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, ...updatedProject }),
    })
    if (!response.ok) throw new Error("Failed to update project")
    const updated = await response.json()
    set((state) => ({
      projects: state.projects.map((project) => (project.id === projectId ? updated : project)),
    }))
  },
  deleteProject: async (projectId) => {
    const response = await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId }),
    })
    if (!response.ok) throw new Error("Failed to delete project")
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
      tasks: state.tasks.filter((task) => task.projectId !== projectId),
    }))
  },
}))

