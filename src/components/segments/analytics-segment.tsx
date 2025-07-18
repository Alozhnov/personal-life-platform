'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Card } from '../ui/card'
// import { Button } from '../ui/button'
import { BarChart3, TrendingUp, Activity, Brain, Heart, CheckCircle, Briefcase, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalActivities: number
  segmentCounts: Record<string, number>
  recentActivities: Array<{
    segment: string
    type: string
    title: string
    created_at: string
  }>
  streaks: Record<string, number>
  weeklyTrends: Record<string, number[]>
}

export function AnalyticsSegment() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7') // days

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    const daysAgo = parseInt(dateRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading analytics:', error)
    } else {
      // Process analytics data
      const totalActivities = data?.length || 0
      const segmentCounts: Record<string, number> = {}
      const recentActivities: AnalyticsData['recentActivities'] = []
      const weeklyTrends: Record<string, number[]> = {}

      data?.forEach(item => {
        // Count by segment
        segmentCounts[item.segment] = (segmentCounts[item.segment] || 0) + 1

        // Recent activities (last 5)
        if (recentActivities.length < 5) {
          const itemData = item.data as Record<string, unknown>
          recentActivities.push({
            segment: item.segment,
            type: item.type,
            title: (itemData?.title as string) || (itemData?.name as string) || 'Activity',
            created_at: item.created_at
          })
        }

        // Weekly trends (simplified)
        const dayOfWeek = new Date(item.created_at).getDay()
        if (!weeklyTrends[item.segment]) {
          weeklyTrends[item.segment] = new Array(7).fill(0)
        }
        weeklyTrends[item.segment][dayOfWeek]++
      })

      // Calculate streaks (simplified)
      const streaks = Object.keys(segmentCounts).reduce((acc, segment) => {
        acc[segment] = Math.floor(segmentCounts[segment] / 7) // Basic streak calculation
        return acc
      }, {} as Record<string, number>)

      setAnalytics({
        totalActivities,
        segmentCounts,
        recentActivities,
        streaks,
        weeklyTrends
      })
    }
    setLoading(false)
  }

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'physical': return Activity
      case 'mental': return Brain
      case 'health': return Heart
      case 'routine': return CheckCircle
      case 'work': return Briefcase
      default: return BarChart3
    }
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'physical': return 'bg-blue-100 text-blue-700'
      case 'mental': return 'bg-purple-100 text-purple-700'
      case 'health': return 'bg-red-100 text-red-700'
      case 'routine': return 'bg-green-100 text-green-700'
      case 'work': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Life Analytics</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Life Analytics</h2>
        <Card className="p-8 text-center">
          <p className="text-gray-500">No data available for analytics.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Life Analytics</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Time Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold">{analytics.totalActivities}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Segments</p>
              <p className="text-2xl font-bold">{Object.keys(analytics.segmentCounts).length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold">
                {Math.round(analytics.totalActivities / parseInt(dateRange))}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold">
                {Math.max(...Object.values(analytics.streaks), 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Segment Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity by Segment</h3>
        <div className="space-y-3">
          {Object.entries(analytics.segmentCounts).map(([segment, count]) => {
            const Icon = getSegmentIcon(segment)
            const percentage = (count / analytics.totalActivities) * 100
            return (
              <div key={segment} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="capitalize font-medium">{segment}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(segment)}`}>
                    {count} activities
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {analytics.recentActivities.map((activity, index) => {
            const Icon = getSegmentIcon(activity.segment)
            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.segment} • {activity.type}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            )
          })}
        </div>
        {analytics.recentActivities.length === 0 && (
          <p className="text-gray-500 text-center py-4">No recent activities to display.</p>
        )}
      </Card>

      {/* Insights & Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights & Suggestions</h3>
        <div className="space-y-3">
          {analytics.totalActivities === 0 ? (
            <p className="text-gray-500">Start logging activities to see personalized insights!</p>
          ) : (
            <>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  🎯 <strong>Most Active Segment:</strong> {' '}
                  {Object.entries(analytics.segmentCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
                  {' '}with {Math.max(...Object.values(analytics.segmentCounts))} activities
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm">
                  📈 <strong>Growth Opportunity:</strong> {' '}
                  Consider adding more activities to underrepresented segments for better life balance.
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm">
                  🔥 <strong>Consistency:</strong> {' '}
                  You&apos;re averaging {Math.round(analytics.totalActivities / parseInt(dateRange))} activities per day.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}