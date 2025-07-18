'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Plus, CheckCircle, Circle, Sunrise, Sunset, Clock, Trash2 } from 'lucide-react'

interface RoutineItem {
  id: string
  type: 'morning' | 'evening' | 'habit' | 'task'
  title: string
  description?: string
  completed: boolean
  streak?: number
  target_frequency?: string
  created_at: string
}

export function RoutineSegment() {
  const { user } = useAuth()
  const [items, setItems] = useState<RoutineItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    type: 'morning' as 'morning' | 'evening' | 'habit' | 'task',
    title: '',
    description: '',
    target_frequency: 'daily'
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
      .eq('segment', 'routine')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading items:', error)
    } else {
      setItems(data?.map(item => ({
        id: item.id,
        ...item.data as Omit<RoutineItem, 'id' | 'created_at'>,
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
      completed: false,
      streak: 0,
      target_frequency: newItem.target_frequency
    }

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user?.id,
        segment: 'routine',
        type: newItem.type,
        data: itemData
      })

    if (error) {
      console.error('Error adding item:', error)
    } else {
      setNewItem({
        type: 'morning',
        title: '',
        description: '',
        target_frequency: 'daily'
      })
      setIsAdding(false)
      loadItems()
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    const newCompleted = !completed
    const newStreak = newCompleted ? (item.streak || 0) + 1 : Math.max(0, (item.streak || 0) - 1)

    const { error } = await supabase
      .from('activities')
      .update({
        data: {
          ...item,
          completed: newCompleted,
          streak: newStreak
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
      case 'morning': return Sunrise
      case 'evening': return Sunset
      case 'habit': return Clock
      case 'task': return Circle
      default: return Circle
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'morning': return 'bg-orange-100 text-orange-700'
      case 'evening': return 'bg-purple-100 text-purple-700'
      case 'habit': return 'bg-green-100 text-green-700'
      case 'task': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Routine</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Routine Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value as 'morning' | 'evening' | 'habit' | 'task'})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="habit">Habit</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                placeholder="e.g., Meditation, Exercise, Read book, Meal prep"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Optional details about this routine item"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Frequency</label>
              <select
                value={newItem.target_frequency}
                onChange={(e) => setNewItem({...newItem, target_frequency: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleComplete(item.id, item.completed)}
                    className="flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      {item.streak && item.streak > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          🔥 {item.streak} streak
                        </span>
                      )}
                    </div>
                    <h3 className={`font-semibold ${item.completed ? 'line-through text-gray-500' : ''}`}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <span>📅 {item.target_frequency}</span>
                      <span>•</span>
                      <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
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
          <p className="text-gray-500 mb-4">No routine items created yet.</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Routine Item
          </Button>
        </Card>
      )}
    </div>
  )
}