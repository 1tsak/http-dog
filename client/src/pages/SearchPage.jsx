import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const HTTP_CODES = [
  // 1xx Informational responses
  '100','101','102','103',
  // 2xx Success
  '200','201','202','203','204','205','206','207','208','226',
  // 3xx Redirection  
  '300','301','302','303','304','305','307','308',
  // 4xx Client errors
  '400','401','402','403','404','405','406','407','408','409','410','411','412','413','414','415','416','417','418','421','422','423','424','425','426','428','429','431','451',
  // 5xx Server errors
  '500','501','502','503','504','505','506','507','508','510','511'
]

function filterCodes(pattern) {
  if (!pattern) return []
  
  // Trim whitespace and convert to lowercase for better matching
  pattern = pattern.trim()
  
  // Handle exact number match first
  if (/^\d{3}$/.test(pattern)) {
    return HTTP_CODES.filter(code => code === pattern)
  }
  
  // Replace x with [0-9] for regex, handle case sensitivity
  let regexStr = '^' + pattern.replace(/x/gi, '[0-9]') + '$'
  
  try {
    let regex = new RegExp(regexStr, 'i')
    return HTTP_CODES.filter(code => regex.test(code))
  } catch (e) {
    // If regex fails, return empty array
    return []
  }
}

export default function SearchPage() {
  const [pattern, setPattern] = useState('')
  const [codes, setCodes] = useState([])
  const [listName, setListName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isLoggedIn = !!localStorage.getItem('token')

  // Quick filter patterns
  const quickFilters = [
    { label: 'All 2xx', pattern: '2xx', description: 'Success responses' },
    { label: 'All 4xx', pattern: '4xx', description: 'Client errors' },
    { label: 'All 5xx', pattern: '5xx', description: 'Server errors' },
    { label: '20x', pattern: '20x', description: '200-209 codes' },
    { label: '40x', pattern: '40x', description: '400-409 codes' },
    { label: '50x', pattern: '50x', description: '500-509 codes' }
  ]

  const handleFilter = (e) => {
    const val = e.target.value
    setPattern(val)
    setCodes(filterCodes(val))
    setSuccess('')
    setError('')
  }

  const handleQuickFilter = (filterPattern) => {
    setPattern(filterPattern)
    setCodes(filterCodes(filterPattern))
    setSuccess('')
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const imageLinks = codes.map(code => `https://http.dog/${code}.jpg`)
      const res = await fetch('http://localhost:8000/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: listName,
          codes,
          imageLinks
        })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          window.dispatchEvent(new Event('authChange'))
          return
        }
        throw new Error(data.message || 'Failed to save list')
      }
      setSuccess('List saved successfully!')
      setListName('')
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      if (err.message === 'Not authenticated') {
        localStorage.removeItem('token')
        window.dispatchEvent(new Event('authChange'))
        return
      }
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 mb-2">Search HTTP Response Codes</h1>
          <p className="text-slate-600 dark:text-slate-300">Filter by response codes and discover matching dog images</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-800 p-8 md:p-12 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Search Pattern
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 2xx, 20x, 203"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-11 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={pattern}
                  onChange={handleFilter}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Use 'x' as wildcard (e.g., 2xx for all 200s, 20x for 200-209)
              </p>
            </div>

            {/* Quick Filter Buttons */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
                Quick Filters
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.pattern}
                    onClick={() => handleQuickFilter(filter.pattern)}
                    className={`p-3 rounded-xl border transition-all duration-200 text-sm ${
                      pattern === filter.pattern
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium">{filter.label}</div>
                    <div className="text-xs opacity-75 mt-1">{filter.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {codes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                    Found {codes.length} matching {codes.length === 1 ? 'code' : 'codes'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {codes.map(code => (
                    <div key={code} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                      <div className="aspect-square mb-2 overflow-hidden rounded-lg">
                        <img
                          src={`https://http.dog/${code}.jpg`}
                          alt={`HTTP ${code}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={e => e.target.style.display='none'}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {codes.length > 0 && (
              <form onSubmit={handleSave} className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Save as List</h3>
                
                {!isLoggedIn && (
                  <div className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-amber-400 dark:text-amber-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-amber-700 dark:text-amber-200 text-sm">Please log in to save lists.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    List Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a name for your list"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50"
                    value={listName}
                    onChange={e => setListName(e.target.value)}
                    required
                    disabled={!isLoggedIn}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-emerald-400 dark:text-emerald-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-emerald-700 dark:text-emerald-200 text-sm">{success}</p>
                      </div>
                      <Link 
                        to="/lists" 
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium hover:underline flex items-center"
                      >
                        View Lists
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={saving || !listName || !isLoggedIn}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Saving List...
                    </>
                  ) : (
                    <>
                      Save List
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {pattern && codes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 dark:text-slate-500 text-lg mb-2">No codes match this pattern</div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Try a different search pattern like "2xx" or "40x"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 