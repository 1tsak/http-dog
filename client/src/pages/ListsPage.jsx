import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString()
}

export default function ListsPage() {
  const [lists, setLists] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCodes, setEditCodes] = useState([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchLists()
    // eslint-disable-next-line
  }, [])

  async function fetchLists() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('https://http-dog-ryhq.onrender.com/api/lists', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          window.dispatchEvent(new Event('authChange'))
          return
        }
        throw new Error(data.message || 'Failed to fetch lists')
      }
      setLists(data)
    } catch (err) {
      if (err.message === 'Not authenticated') {
        localStorage.removeItem('token')
        window.dispatchEvent(new Event('authChange'))
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this list?')) return
    setDeleting(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8000/api/lists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          window.dispatchEvent(new Event('authChange'))
          return
        }
        throw new Error('Failed to delete')
      }
      setLists(lists => lists.filter(l => l._id !== id))
      setSelected(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  function startEdit(list) {
    setEditing(true)
    setEditName(list.name)
    setEditCodes(list.codes)
    setSelected(list)
    setSuccess('')
    setError('')
  }

  async function handleEditSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      const imageLinks = editCodes.map(code => `https://http.dog/${code}.jpg`)
      const res = await fetch(`http://localhost:8000/api/lists/${selected._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          codes: editCodes,
          imageLinks
        })
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          window.dispatchEvent(new Event('authChange'))
          return
        }
        throw new Error('Failed to update')
      }
      setEditing(false)
      setSelected(null)
      setSuccess('List updated successfully!')
      fetchLists()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100 mb-2">Your Lists</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your saved HTTP status code collections</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-800 p-8 md:p-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Loading your lists...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Lists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {lists.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                      <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-lg mb-2">No lists found</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Create your first list to get started</p>
                    <Link 
                      to="/search" 
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search HTTP Codes
                    </Link>
                  </div>
                )}
                {lists.map(list => (
                  <div
                    key={list._id}
                    className={`group relative bg-white dark:bg-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${
                      selected && selected._id === list._id 
                        ? 'border-blue-300 dark:border-blue-500 shadow-lg scale-[1.02] bg-blue-50/50 dark:bg-blue-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => { setSelected(list); setEditing(false); setSuccess(''); setError('') }}
                  >
                    <div className="font-medium text-slate-800 dark:text-slate-100 text-lg mb-3 group-hover:text-slate-900 dark:group-hover:text-slate-50">
                      {list.name}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Created {formatDate(list.createdAt || list.creationDate)}
                      </div>
                      <div className="inline-flex items-center bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          {list.codes.length} {list.codes.length === 1 ? 'code' : 'codes'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center">
                    <svg className="h-5 w-5 text-emerald-400 dark:text-emerald-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-emerald-700 dark:text-emerald-200 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Selected List Details */}
              {selected && !editing && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-1">{selected.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {selected.codes.length} HTTP status {selected.codes.length === 1 ? 'code' : 'codes'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center"
                        onClick={() => startEdit(selected)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center"
                        onClick={() => handleDelete(selected._id)}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {selected.codes.map((code, i) => (
                      <div key={code} className="bg-white dark:bg-slate-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
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

              {/* Edit Form */}
              {editing && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-6">Edit List</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        List Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        required
                        placeholder="Enter list name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        HTTP Status Codes
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={editCodes.join(',')}
                        onChange={e => setEditCodes(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        required
                        placeholder="200, 404, 500..."
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate multiple codes with commas</p>
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

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleEditSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-medium transition-colors duration-200"
                        onClick={() => { setEditing(false); setSuccess(''); setError('') }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}