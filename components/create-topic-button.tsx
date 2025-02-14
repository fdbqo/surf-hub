"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateTopicForm } from "./create-topic-form"

export function CreateTopicButton() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="mb-8">
      <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Create New Topic"}</Button>
      {showForm && <CreateTopicForm onSuccess={() => setShowForm(false)} />}
    </div>
  )
}

