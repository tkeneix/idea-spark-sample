"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Technology {
  id: number
  name: string
  category?: string
  maturity_level?: string
  description: string
  use_cases?: string
  performance_metrics?: string | object
  image_url?: string
  created_at: string
}

const categories = ["AI/ML", "IoT", "Blockchain", "Cloud", "Mobile", "Web", "Hardware", "Other"]
const maturityLevels = ["Research", "Prototype", "Beta", "Production", "Mature"]

export function TechnologyManager() {
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    maturity_level: "",
    description: "",
    use_cases: "",
    performance_metrics: "",
    image_url: "",
  })

  useEffect(() => {
    fetchTechnologies()
  }, [])

  const fetchTechnologies = async () => {
    try {
      const response = await fetch("/api/admin/technologies")
      if (response.ok) {
        const data = await response.json()
        setTechnologies(data.technologies || [])
      }
    } catch (error) {
      console.error("Error fetching technologies:", error)
      toast.error("Failed to fetch technologies")
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
      const response = await fetch("/api/admin/technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setTechnologies((prev) => [data.technology, ...prev])
        setFormData({
          name: "",
          category: "",
          maturity_level: "",
          description: "",
          use_cases: "",
          performance_metrics: "",
          image_url: "",
        })
        setIsCreating(false)
        toast.success("Technology created successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create technology")
      }
    } catch (error) {
      console.error("Error creating technology:", error)
      toast.error("Failed to create technology")
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name || !formData.description) {
      toast.error("Name and description are required")
      return
    }

    try {
      const response = await fetch("/api/admin/technologies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData }),
      })

      if (response.ok) {
        const data = await response.json()
        setTechnologies((prev) => prev.map((tech) => (tech.id === id ? data.technology : tech)))
        setEditingId(null)
        setFormData({
          name: "",
          category: "",
          maturity_level: "",
          description: "",
          use_cases: "",
          performance_metrics: "",
          image_url: "",
        })
        toast.success("Technology updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update technology")
      }
    } catch (error) {
      console.error("Error updating technology:", error)
      toast.error("Failed to update technology")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this technology?")) return

    try {
      const response = await fetch(`/api/admin/technologies?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTechnologies((prev) => prev.filter((tech) => tech.id !== id))
        toast.success("Technology deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete technology")
      }
    } catch (error) {
      console.error("Error deleting technology:", error)
      toast.error("Failed to delete technology")
    }
  }

  const startEdit = (technology: Technology) => {
    setEditingId(technology.id)
    setFormData({
      name: technology.name,
      category: technology.category || "",
      maturity_level: technology.maturity_level || "",
      description: technology.description,
      use_cases: technology.use_cases || "",
      performance_metrics: typeof technology.performance_metrics === 'object' 
        ? JSON.stringify(technology.performance_metrics, null, 2) 
        : technology.performance_metrics || "",
      image_url: technology.image_url || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({
      name: "",
      category: "",
      maturity_level: "",
      description: "",
      use_cases: "",
      performance_metrics: "",
      image_url: "",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technologies</CardTitle>
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
          <CardTitle>Technologies</CardTitle>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Technology
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Form */}
        {isCreating && (
          <div className="p-4 border rounded-lg bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Technology Name</Label>
                <Input
                  id="new-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Machine Learning Platform"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-maturity">Maturity Level</Label>
                <Select
                  value={formData.maturity_level}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, maturity_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maturity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {maturityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-image">Image URL</Label>
                <Input
                  id="new-image"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="new-description">Description</Label>
                <Textarea
                  id="new-description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this technology..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-use-cases">Use Cases</Label>
                <Textarea
                  id="new-use-cases"
                  value={formData.use_cases}
                  onChange={(e) => setFormData((prev) => ({ ...prev, use_cases: e.target.value }))}
                  placeholder="List potential use cases..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-metrics">Performance Metrics</Label>
                <Textarea
                  id="new-metrics"
                  value={formData.performance_metrics}
                  onChange={(e) => setFormData((prev) => ({ ...prev, performance_metrics: e.target.value }))}
                  placeholder="Key performance indicators..."
                  rows={2}
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
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

        {/* Technologies List */}
        <div className="space-y-3">
          {technologies.map((tech) => (
            <div key={tech.id} className="p-4 border rounded-lg">
              {editingId === tech.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Technology Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Maturity Level</Label>
                    <Select
                      value={formData.maturity_level}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, maturity_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maturityLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Use Cases</Label>
                    <Textarea
                      value={formData.use_cases}
                      onChange={(e) => setFormData((prev) => ({ ...prev, use_cases: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Performance Metrics</Label>
                    <Textarea
                      value={formData.performance_metrics}
                      onChange={(e) => setFormData((prev) => ({ ...prev, performance_metrics: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button onClick={() => handleUpdate(tech.id)} size="sm">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{tech.name}</h3>
                      <Badge variant="outline">ID: {tech.id}</Badge>
                      {tech.category && <Badge variant="secondary">{tech.category}</Badge>}
                      {tech.maturity_level && <Badge variant="outline">{tech.maturity_level}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                    {tech.use_cases && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Use Cases:</p>
                        <p className="text-xs text-muted-foreground">{tech.use_cases}</p>
                      </div>
                    )}
                    {tech.performance_metrics && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Performance:</p>
                        <p className="text-xs text-muted-foreground">
                          {typeof tech.performance_metrics === 'object' 
                            ? JSON.stringify(tech.performance_metrics, null, 2) 
                            : tech.performance_metrics}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(tech.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(tech)} variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(tech.id)} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {technologies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No technologies found. Create your first technology to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
