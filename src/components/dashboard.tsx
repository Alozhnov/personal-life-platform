'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from './ui/button'
import { PhysicalSegment } from './segments/physical-segment'
import { MentalSegment } from './segments/mental-segment'
import { HealthSegment } from './segments/health-segment'
import { RoutineSegment } from './segments/routine-segment'
import { WorkSegment } from './segments/work-segment'
import { AnalyticsSegment } from './segments/analytics-segment'
import { 
  Activity, 
  Brain, 
  Heart, 
  CheckCircle, 
  Briefcase, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'

const segments = [
  { id: 'physical', name: 'Physical', icon: Activity, component: PhysicalSegment },
  { id: 'mental', name: 'Mental', icon: Brain, component: MentalSegment },
  { id: 'health', name: 'Health', icon: Heart, component: HealthSegment },
  { id: 'routine', name: 'Routine', icon: CheckCircle, component: RoutineSegment },
  { id: 'work', name: 'Work', icon: Briefcase, component: WorkSegment },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, component: AnalyticsSegment },
]

export function Dashboard() {
  const [activeSegment, setActiveSegment] = useState('physical')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()

  const ActiveComponent = segments.find(s => s.id === activeSegment)?.component || PhysicalSegment

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Life Platform</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <div className="space-y-2">
              {segments.map((segment) => {
                const Icon = segment.icon
                return (
                  <button
                    key={segment.id}
                    onClick={() => {
                      setActiveSegment(segment.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSegment === segment.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {segment.name}
                  </button>
                )
              })}
            </div>
          </nav>
          <div className="p-4">
            <Button variant="outline" onClick={signOut} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">Life Platform</h1>
        </div>
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-2">
            {segments.map((segment) => {
              const Icon = segment.icon
              return (
                <button
                  key={segment.id}
                  onClick={() => setActiveSegment(segment.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSegment === segment.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {segment.name}
                </button>
              )
            })}
          </div>
        </nav>
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-2">
            Signed in as {user?.email}
          </div>
          <Button variant="outline" onClick={signOut} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-medium">
              {segments.find(s => s.id === activeSegment)?.name}
            </h1>
            <div className="w-6" />
          </div>
        </div>
        <main className="flex-1">
          <div className="p-4 lg:p-8">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  )
}