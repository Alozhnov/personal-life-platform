'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Plus, BookOpen, Lightbulb, Target, Trash2 } from 'lucide-react'

interface MentalActivity {
  id: string
  type: 'reading' | 'learning' | 'creative' | 'meditation'
  title: string
  duration?: number
  pages?: number
  progress?: number
  notes?: string
  created_at: string
}

export function MentalSegment() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<MentalActivity[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newActivity, setNewActivity] = useState({
    type: 'reading' as 'reading' | 'learning' | 'creative' | 'meditation',
    title: '',
    duration: '',
    pages: '',
    progress: '',
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
      .eq('segment', 'mental')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading activities:', error)
    } else {
      setActivities(data?.map(item => ({
        id: item.id,
        ...item.data as Omit<MentalActivity, 'id' | 'created_at'>,
        created_at: item.created_at
      })) || [])
    }
  }

  const addActivity = async () => {
    if (!newActivity.title) return

    const activityData = {
      type: newActivity.type,
      title: newActivity.title,
      duration: newActivity.duration ? parseInt(newActivity.duration) : undefined,
      pages: newActivity.pages ? parseInt(newActivity.pages) : undefined,
      progress: newActivity.progress ? parseInt(newActivity.progress) : undefined,
      notes: newActivity.notes || undefined
    }

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user?.id,
        segment: 'mental',
        type: newActivity.type,
        data: activityData
      })

    if (error) {
      console.error('Error adding activity:', error)
    } else {
      setNewActivity({
        type: 'reading',
        title: '',
        duration: '',
        pages: '',
        progress: '',
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reading': return BookOpen
      case 'learning': return Target
      case 'creative': return Lightbulb
      case 'meditation': return Target
      default: return BookOpen
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mental Activity</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Mental Activity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity({...newActivity, type: e.target.value as 'reading' | 'learning' | 'creative' | 'meditation'})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="reading">Reading</option>
                <option value="learning">Learning</option>
                <option value="creative">Creative</option>
                <option value="meditation">Meditation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                placeholder="e.g., Read 'Atomic Habits', Learn React, Creative writing"
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
                <label className="block text-sm font-medium mb-1">Pages/Units</label>
                <Input
                  type="number"
                  value={newActivity.pages}
                  onChange={(e) => setNewActivity({...newActivity, pages: e.target.value})}
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Progress %</label>
                <Input
                  type="number"
                  max="100"
                  value={newActivity.progress}
                  onChange={(e) => setNewActivity({...newActivity, progress: e.target.value})}
                  placeholder="75"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                value={newActivity.notes}
                onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                placeholder="Key insights, thoughts, or reflections"
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
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          return (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {activity.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{activity.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    {activity.duration && <span>⏱️ {activity.duration} min</span>}
                    {activity.pages && <span>📄 {activity.pages} pages</span>}
                    {activity.progress && <span>📈 {activity.progress}%</span>}
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
          )
        })}
      </div>

      {activities.length === 0 && !isAdding && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No mental activities recorded yet.</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Activity
          </Button>
        </Card>
      )}
    </div>
  )
}