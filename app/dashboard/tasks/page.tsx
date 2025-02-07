"use client"

import { useState, useEffect } from "react"
import { useTaskStore } from "@/store/taskStore"
import type { Task } from "@/types"
import { Loader } from "@/components/Loader"

export default function TasksPage() {
  const { tasks, projects, addTask, updateTask, deleteTask, setTasks, setProjects } = useTaskStore()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskProject, setNewTaskProject] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await fetch("/api/tasks")
        const projectsResponse = await fetch("/api/projects")
        if (!tasksResponse.ok || !projectsResponse.ok) throw new Error("Failed to fetch data")
        const tasksData = await tasksResponse.json()
        const projectsData = await projectsResponse.json()
        setTasks(tasksData)
        setProjects(projectsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [setTasks, setProjects])

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      const newTask: Omit<Task, "id" | "createdAt"> = {
        title: newTaskTitle,
        userId: 1, // This should be the actual user ID
        projectId: newTaskProject ? Number(newTaskProject) : undefined,
        priority: newTaskPriority,
        completed: false,
      }
      await addTask(newTask)
      setNewTaskTitle("")
      setNewTaskProject("")
      setNewTaskPriority("medium")
    }
  }

  const handleToggleTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      await updateTask(taskId, { completed: !task.completed })
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId)
  }

  if (isLoading) return <Loader />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter new task"
          className="border p-2 w-full dark:bg-gray-700 dark:text-white"
        />
        <select
          value={newTaskProject}
          onChange={(e) => setNewTaskProject(e.target.value)}
          className="border p-2 w-full dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select Project (Optional)</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
          className="border p-2 w-full dark:bg-gray-700 dark:text-white"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Add Task
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleTask(task.id)}
              className="mr-2"
            />
            <span className={`flex-grow ${task.completed ? "line-through" : ""}`}>
              {task.title}
              {task.projectId && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({projects.find((p) => p.id === task.projectId)?.name})
                </span>
              )}
            </span>
            <span
              className={`mr-2 text-sm ${
                task.priority === "high"
                  ? "text-red-500"
                  : task.priority === "medium"
                    ? "text-yellow-500"
                    : "text-green-500"
              }`}
            >
              {task.priority}
            </span>
            <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 text-white px-2 py-1 rounded">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

