"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Theme {
  id: number
  name: string
  description: string
  image_url?: string
  created_at: string
}

export function ThemeManager() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  })

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/admin/themes")
      if (response.ok) {
        const data = await response.json()
        setThemes(data.themes || [])
      }
    } catch (error) {
      console.error("Error fetching themes:", error)
      toast.error("Failed to fetch themes")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Name and description are required")
      return
    }

    try {
      const response = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setThemes((prev) => [data.theme, ...prev])
        setFormData({ name: "", description: "", image_url: "" })
        setIsCreating(false)
        toast.success("Theme created successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create theme")
      }
    } catch (error) {
      console.error("Error creating theme:", error)
      toast.error("Failed to create theme")
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name || !formData.description) {
      toast.error("Name and description are required")
      return
    }

    try {
      const response = await fetch("/api/admin/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      })

      if (response.ok) {
        const data = await response.json()
        setThemes((prev) => prev.map((theme) => (theme.id === id ? data.theme : theme)))
        setEditingId(null)
        setFormData({ name: "", description: "", image_url: "" })
        toast.success("Theme updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update theme")
      }
    } catch (error) {
      console.error("Error updating theme:", error)
      toast.error("Failed to update theme")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this theme?")) return

    try {
      const response = await fetch(`/api/admin/themes?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setThemes((prev) => prev.filter((theme) => theme.id !== id))
        toast.success("Theme deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete theme")
      }
    } catch (error) {
      console.error("Error deleting theme:", error)
      toast.error("Failed to delete theme")
    }
  }

  const startEdit = (theme: Theme) => {
    setEditingId(theme.id)
    setFormData({
      name: theme.name,
      description: theme.description,
      image_url: theme.image_url || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: "", description: "", image_url: "" })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Business Themes</CardTitle>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Theme
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Form */}
        {isCreating && (
          <div className="p-4 border rounded-lg bg-muted/20">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Theme Name</Label>
                <Input
                  id="new-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Healthcare"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-description">Description</Label>
                <Textarea
                  id="new-description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this business theme..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-image">Image URL (optional)</Label>
                <Input
                  id="new-image"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button onClick={cancelEdit} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Themes List */}
        <div className="space-y-3">
          {themes.map((theme) => (
            <div key={theme.id} className="p-4 border rounded-lg">
              {editingId === theme.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(theme.id)} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{theme.name}</h3>
                      <Badge variant="outline">ID: {theme.id}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                    {theme.image_url && <p className="text-xs text-muted-foreground">Image: {theme.image_url}</p>}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(theme.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(theme)} variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(theme.id)} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {themes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No themes found. Create your first theme to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
