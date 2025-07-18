'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('Testing connection...')
    
    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('activities').select('count')
      
      if (error) {
        setResult(`Database error: ${error.message}`)
      } else {
        setResult('✅ Database connection successful!')
      }
    } catch (err) {
      setResult(`Connection error: ${err}`)
    }
    
    setLoading(false)
  }

  const testSignUp = async () => {
    setLoading(true)
    setResult('Testing signup...')
    
    try {
      const testEmail = `test${Date.now()}@example.com`
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!'
      })
      
      if (error) {
        setResult(`Signup error: ${error.message}`)
      } else {
        setResult(`✅ Signup successful! Check Supabase for user: ${testEmail}`)
      }
    } catch (err) {
      setResult(`Signup error: ${err}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Environment Variables:</p>
          <p className="text-xs bg-gray-100 p-2 rounded">
            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}<br/>
            KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>
        
        <div className="space-x-2">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Database Connection
          </button>
          
          <button
            onClick={testSignUp}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Test Signup
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      </div>
    </div>
  )
}