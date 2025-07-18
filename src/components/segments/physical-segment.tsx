'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Plus, Trash2 } from 'lucide-react'

interface PhysicalActivity {
  id: string
  type: 'workout' | 'movement' | 'measurement'
  name: string
  duration?: number
  calories?: number
  weight?: number
  notes?: string
  created_at: string
}

export function PhysicalSegment() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<PhysicalActivity[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newActivity, setNewActivity] = useState({
    type: 'workout' as 'workout' | 'movement' | 'measurement',
    name: '',
    duration: '',
    calories: '',
    weight: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadActivities()
    }
  }, [user])

  const loadActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .eq('segment', 'physical')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading activities:', error)
    } else {
      setActivities(data?.map(item => ({
        id: item.id,
        ...item.data as Omit<PhysicalActivity, 'id' | 'created_at'>,
        created_at: item.created_at
      })) || [])
    }
  }

  const addActivity = async () => {
    if (!newActivity.name) return

    const activityData = {
      type: newActivity.type,
      name: newActivity.name,
      duration: newActivity.duration ? parseInt(newActivity.duration) : undefined,
      calories: newActivity.calories ? parseInt(newActivity.calories) : undefined,
      weight: newActivity.weight ? parseFloat(newActivity.weight) : undefined,
      notes: newActivity.notes || undefined
    }

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user?.id,
        segment: 'physical',
        type: newActivity.type,
        data: activityData
      })

    if (error) {
      console.error('Error adding activity:', error)
    } else {
      setNewActivity({
        type: 'workout',
        name: '',
        duration: '',
        calories: '',
        weight: '',
        notes: ''
      })
      setIsAdding(false)
      loadActivities()
    }
  }

  const deleteActivity = async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting activity:', error)
    } else {
      loadActivities()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Physical Activity</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity({...newActivity, type: e.target.value as 'workout' | 'movement' | 'measurement'})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="workout">Workout</option>
                <option value="movement">Movement</option>
                <option value="measurement">Measurement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                placeholder="e.g., Morning run, Push-ups, Weight check"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <Input
                  type="number"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories</label>
                <Input
                  type="number"
                  value={newActivity.calories}
                  onChange={(e) => setNewActivity({...newActivity, calories: e.target.value})}
                  placeholder="250"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={newActivity.weight}
                  onChange={(e) => setNewActivity({...newActivity, weight: e.target.value})}
                  placeholder="70.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                value={newActivity.notes}
                onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                placeholder="How did it feel? Any observations?"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addActivity}>Add Activity</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {activity.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{activity.name}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  {activity.duration && <span>⏱️ {activity.duration} min</span>}
                  {activity.calories && <span>🔥 {activity.calories} cal</span>}
                  {activity.weight && <span>⚖️ {activity.weight} kg</span>}
                </div>
                {activity.notes && (
                  <p className="text-sm text-gray-600 mt-2">{activity.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteActivity(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activities.length === 0 && !isAdding && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No physical activities recorded yet.</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Activity
          </Button>
        </Card>
      )}
    </div>
  )
}