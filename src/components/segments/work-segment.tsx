'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Plus, CheckCircle, Clock, Target, Briefcase, Trash2 } from 'lucide-react'

interface WorkItem {
  id: string
  type: 'task' | 'project' | 'meeting' | 'focus' | 'goal'
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed'
  duration?: number
  due_date?: string
  created_at: string
}

export function WorkSegment() {
  const { user } = useAuth()
  const [items, setItems] = useState<WorkItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    type: 'task' as 'task' | 'project' | 'meeting' | 'focus' | 'goal',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    duration: '',
    due_date: ''
  })

  useEffect(() => {
    if (user) {
      loadItems()
    }
  }, [user])

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .eq('segment', 'work')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading items:', error)
    } else {
      setItems(data?.map(item => ({
        id: item.id,
        ...item.data as Omit<WorkItem, 'id' | 'created_at'>,
        created_at: item.created_at
      })) || [])
    }
  }

  const addItem = async () => {
    if (!newItem.title) return

    const itemData = {
      type: newItem.type,
      title: newItem.title,
      description: newItem.description || undefined,
      priority: newItem.priority,
      status: 'todo' as const,
      duration: newItem.duration ? parseInt(newItem.duration) : undefined,
      due_date: newItem.due_date || undefined
    }

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user?.id,
        segment: 'work',
        type: newItem.type,
        data: itemData
      })

    if (error) {
      console.error('Error adding item:', error)
    } else {
      setNewItem({
        type: 'task',
        title: '',
        description: '',
        priority: 'medium',
        duration: '',
        due_date: ''
      })
      setIsAdding(false)
      loadItems()
    }
  }

  const updateStatus = async (id: string, newStatus: WorkItem['status']) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    const { error } = await supabase
      .from('activities')
      .update({
        data: {
          ...item,
          status: newStatus
        }
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating item:', error)
    } else {
      loadItems()
    }
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting item:', error)
    } else {
      loadItems()
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckCircle
      case 'project': return Briefcase
      case 'meeting': return Clock
      case 'focus': return Target
      case 'goal': return Target
      default: return CheckCircle
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'todo': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Work & Productivity</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Work Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value as 'task' | 'project' | 'meeting' | 'focus' | 'goal'})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="task">Task</option>
                <option value="project">Project</option>
                <option value="meeting">Meeting</option>
                <option value="focus">Focus Session</option>
                <option value="goal">Goal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                placeholder="e.g., Complete project proposal, Team meeting, Deep work session"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Optional details about this work item"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({...newItem, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <Input
                  type="number"
                  value={newItem.duration}
                  onChange={(e) => setNewItem({...newItem, duration: e.target.value})}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <Input
                  type="date"
                  value={newItem.due_date}
                  onChange={(e) => setNewItem({...newItem, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem}>Add Item</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {items.map((item) => {
          const Icon = getItemIcon(item.type)
          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {item.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-lg ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    {item.duration && <span>⏱️ {item.duration} min</span>}
                    {item.due_date && <span>📅 Due: {new Date(item.due_date).toLocaleDateString()}</span>}
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(item.id, item.status === 'todo' ? 'in_progress' : 'completed')}
                    >
                      {item.status === 'todo' ? 'Start' : 'Complete'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && !isAdding && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No work items created yet.</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Work Item
          </Button>
        </Card>
      )}
    </div>
  )
}