"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useTaskStore } from "@/store/taskStore"
import { Loader } from "@/components/Loader"
import type { Task, Project } from "@/types"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { tasks, projects, setTasks, setProjects } = useTaskStore()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const { isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
    const res = await fetch("/api/tasks")
    if (!res.ok) throw new Error("Failed to fetch tasks")
    const data = await res.json()
      return data
    }
  })

  const { isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()
      setProjects(data)
      return data
    }
  })

  if (status === "loading" || tasksLoading || projectsLoading) {
    return <Loader />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
        <div className="space-y-2">
          <p>Total Tasks: {tasks.length}</p>
          <p>Completed Tasks: {tasks.filter((task) => task.completed).length}</p>
          <p>Pending Tasks: {tasks.filter((task) => !task.completed).length}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
        <div className="space-y-2">
          <p>Total Projects: {projects.length}</p>
          <p>
            Active Projects:{" "}
            {
              projects.filter((project) => tasks.some((task) => task.projectId === project.id && !task.completed))
                .length
            }
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-center justify-between">
              <span className={task.completed ? "line-through text-gray-500" : ""}>{task.title}</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  task.priority === "high"
                    ? "bg-red-200 text-red-800"
                    : task.priority === "medium"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-green-200 text-green-800"
                }`}
              >
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

