"use client"

import { useState, useEffect } from "react"
import { useTaskStore } from "@/store/taskStore"
import type { Project } from "@/types"
import { Loader } from "@/components/Loader"

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject, setProjects } = useTaskStore()
  const [newProjectName, setNewProjectName] = useState("")
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) throw new Error("Failed to fetch projects")
        const projectsData = await response.json()
        setProjects(projectsData)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [setProjects])

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      await addProject({ name: newProjectName, userId: 1 }) // Replace 1 with actual user ID
      setNewProjectName("")
    }
  }

  const handleUpdateProject = async () => {
    if (editingProject && editingProject.name.trim()) {
      await updateProject(editingProject.id, { name: editingProject.name })
      setEditingProject(null)
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project? All associated tasks will be deleted as well.")) {
      await deleteProject(projectId)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={handleAddProject}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Project
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              {editingProject && editingProject.id === project.id ? (
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                />
              ) : (
                <span className="text-lg font-medium">{project.name}</span>
              )}
              <div className="space-x-2">
                {editingProject && editingProject.id === project.id ? (
                  <button
                    onClick={handleUpdateProject}
                    className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingProject(project)}
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

