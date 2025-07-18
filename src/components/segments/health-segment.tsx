'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { Plus, Heart, Thermometer, Activity, Trash2 } from 'lucide-react'

interface HealthEntry {
  id: string
  type: 'vitals' | 'symptoms' | 'medication' | 'appointment'
  title: string
  value?: string
  unit?: string
  severity?: number
  notes?: string
  created_at: string
}

export function HealthSegment() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<HealthEntry[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newEntry, setNewEntry] = useState({
    type: 'vitals' as 'vitals' | 'symptoms' | 'medication' | 'appointment',
    title: '',
    value: '',
    unit: '',
    severity: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user])

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .eq('segment', 'health')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading entries:', error)
    } else {
      setEntries(data?.map(item => ({
        id: item.id,
        ...item.data as Omit<HealthEntry, 'id' | 'created_at'>,
        created_at: item.created_at
      })) || [])
    }
  }

  const addEntry = async () => {
    if (!newEntry.title) return

    const entryData = {
      type: newEntry.type,
      title: newEntry.title,
      value: newEntry.value || undefined,
      unit: newEntry.unit || undefined,
      severity: newEntry.severity ? parseInt(newEntry.severity) : undefined,
      notes: newEntry.notes || undefined
    }

    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user?.id,
        segment: 'health',
        type: newEntry.type,
        data: entryData
      })

    if (error) {
      console.error('Error adding entry:', error)
    } else {
      setNewEntry({
        type: 'vitals',
        title: '',
        value: '',
        unit: '',
        severity: '',
        notes: ''
      })
      setIsAdding(false)
      loadEntries()
    }
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting entry:', error)
    } else {
      loadEntries()
    }
  }

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'vitals': return Activity
      case 'symptoms': return Thermometer
      case 'medication': return Heart
      case 'appointment': return Heart
      default: return Heart
    }
  }

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-700'
    if (severity <= 6) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Management</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Health Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({...newEntry, type: e.target.value as 'vitals' | 'symptoms' | 'medication' | 'appointment'})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="vitals">Vitals</option>
                <option value="symptoms">Symptoms</option>
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                placeholder="e.g., Blood pressure, Headache, Vitamin D, Doctor visit"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <Input
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({...newEntry, value: e.target.value})}
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <Input
                  value={newEntry.unit}
                  onChange={(e) => setNewEntry({...newEntry, unit: e.target.value})}
                  placeholder="mmHg, mg, etc."
                />
              </div>
            </div>
            {(newEntry.type as string) === 'symptoms' && (
              <div>
                <label className="block text-sm font-medium mb-1">Severity (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newEntry.severity}
                  onChange={(e) => setNewEntry({...newEntry, severity: e.target.value})}
                  placeholder="5"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="Additional details, observations, or context"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addEntry}>Add Entry</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {entries.map((entry) => {
          const Icon = getEntryIcon(entry.type)
          return (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-red-600" />
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {entry.type}
                    </span>
                    {entry.severity && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                        Severity: {entry.severity}/10
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{entry.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    {entry.value && (
                      <span>📊 {entry.value} {entry.unit}</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {entries.length === 0 && !isAdding && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No health entries recorded yet.</p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Entry
          </Button>
        </Card>
      )}
    </div>
  )
}