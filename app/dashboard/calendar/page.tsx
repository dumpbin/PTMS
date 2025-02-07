"use client"

import { useState, useEffect } from "react"
import { useTaskStore } from "@/store/taskStore"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventInput, DateSelectArg } from "@fullcalendar/core"
import type { Task } from "@/types"
import { Loader } from "@/components/Loader"

export default function CalendarPage() {
  const { tasks, projects, addTask, setTasks, setProjects } = useTaskStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
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

  const events: EventInput[] = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: task.id.toString(),
      title: task.title,
      date: task.dueDate,
      backgroundColor: task.completed
        ? "green"
        : task.priority === "high"
          ? "red"
          : task.priority === "medium"
            ? "orange"
            : "blue",
      extendedProps: {
        description: task.description,
        project: projects.find((p) => p.id === task.projectId)?.name,
        priority: task.priority,
      },
    }))

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.startStr)
  }

  const handleAddTask = async (title: string, priority: "low" | "medium" | "high") => {
    if (title.trim() && selectedDate) {
      const newTask: Omit<Task, "id" | "createdAt"> = {
        title: title,
        userId: 1, // This should be the actual user ID
        priority: priority,
        dueDate: selectedDate,
        completed: false,
      }
      await addTask(newTask)
      setSelectedDate(null)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Calendar</h2>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventContent={(eventInfo) => (
            <div className="p-1">
              <div className="font-semibold">{eventInfo.event.title}</div>
              <div className="text-xs">{eventInfo.event.extendedProps.project}</div>
              <div className="text-xs capitalize">{eventInfo.event.extendedProps.priority}</div>
            </div>
          )}
        />
      </div>
      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add Task for {selectedDate}</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const title = (form.elements.namedItem("title") as HTMLInputElement).value
              const priority = (form.elements.namedItem("priority") as HTMLSelectElement).value as
                | "low"
                | "medium"
                | "high"
              handleAddTask(title, priority)
              form.reset()
            }}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  name="priority"
                  id="priority"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

