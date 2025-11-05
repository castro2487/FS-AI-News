/**
 * Admin Dashboard Page
 * Stunning protected page for event management with modern design
 */

'use client';

import { useState, useEffect } from 'react';
import { Event, CreateEventInput, UpdateEventInput, EventStatus } from '../../lib/types';
import { apiClient, APIError } from '../../lib/api';
import EventCard from '../../components/EventCard';
import EventForm from '../../components/EventForm';

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Enhanced Filters
  const [statusFilter, setStatusFilter] = useState<EventStatus[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'startAt' | 'updatedAt'>('startAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const savedToken = apiClient.getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      loadEvents();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      apiClient.setToken(token);
      setIsAuthenticated(true);
      await loadEvents();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid token');
      apiClient.setToken(null);
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    setIsAuthenticated(false);
    setToken('');
    setEvents([]);
    setShowForm(false);
    setEditingEvent(null);
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (statusFilter.length > 0) filters.status = statusFilter;
      if (locationFilter) filters.locations = [locationFilter];

      const result = await apiClient.getEvents(filters);
      let processedEvents = result.data;

      // Apply search filter
      if (searchTerm) {
        processedEvents = processedEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      processedEvents.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortBy) {
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'startAt':
            aVal = new Date(a.startAt);
            bVal = new Date(b.startAt);
            break;
          case 'updatedAt':
            aVal = new Date(a.updatedAt);
            bVal = new Date(b.updatedAt);
            break;
        }
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setEvents(processedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [statusFilter, locationFilter, searchTerm, sortBy, sortOrder]);

  const handleCreateEvent = async (data: CreateEventInput) => {
    setIsSubmitting(true);
    try {
      await apiClient.createEvent(data);
      setShowForm(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (eventId: string, update: UpdateEventInput) => {
    try {
      await apiClient.updateEvent(eventId, update);
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to update event');
    }
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleStatusChange = async (event: Event, newStatus: EventStatus) => {
    if (confirm(`Change status to ${newStatus}?`)) {
      await handleUpdateEvent(event.id, { status: newStatus });
    }
  };

  const getStats = () => {
    const total = events.length;
    const published = events.filter(e => e.status === EventStatus.PUBLISHED).length;
    const draft = events.filter(e => e.status === EventStatus.DRAFT).length;
    const cancelled = events.filter(e => e.status === EventStatus.CANCELLED).length;
    return { total, published, draft, cancelled };
  };

  const stats = getStats();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card-intense rounded-3xl p-10 shadow-2xl border border-white/40">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold gradient-text heading-display mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 font-medium">Secure access to event management</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{loginError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Access Token
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="input-field pl-6 pr-6 py-4 text-lg font-medium"
                    placeholder="Enter your admin access token"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200/50">
                  <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Demo token: <code className="bg-white/80 px-2 py-1 rounded font-mono text-blue-900">admin-token-123</code>
                  </p>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Secure Login
                </div>
              </button>
            </form>
            
            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">256-bit SSL encryption</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Enterprise secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="relative hero-gradient text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full blur-xl float-animation"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-2xl float-animation animation-delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            {/* Header content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold heading-display text-shadow-lg">
                    Admin Dashboard
                  </h1>
                  <p className="text-white/90 text-lg font-medium mt-2">
                    Event Management Center
                  </p>
                </div>
              </div>
              
              <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                Manage your events with powerful tools, real-time updates, and intelligent insights.
                Create, edit, and organize events with professional-grade efficiency.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowForm(true);
                }}
                className="group relative overflow-hidden px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Event
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </button>
              
              <button
                onClick={handleLogout}
                className="group relative overflow-hidden px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="glass-card-intense rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Total Events</p>
            </div>
            
            <div className="glass-card-intense rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.published}</h3>
              <p className="text-gray-600 font-medium">Published</p>
            </div>
            
            <div className="glass-card-intense rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.draft}</h3>
              <p className="text-gray-600 font-medium">Drafts</p>
            </div>
            
            <div className="glass-card-intense rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.cancelled}</h3>
              <p className="text-gray-600 font-medium">Cancelled</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm ? (
          <div className="glass-card-intense rounded-3xl p-10 mb-8 shadow-2xl border border-white/40">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 heading-display">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {editingEvent ? 'Update event details and settings' : 'Fill in the details to create a new event'}
                </p>
              </div>
            </div>
            <EventForm
              initialData={editingEvent || undefined}
              onSubmit={handleCreateEvent}
              onCancel={() => {
                setShowForm(false);
                setEditingEvent(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <>
            {/* Enhanced Filters Section */}
            <div className="glass-card-intense rounded-3xl p-10 mb-12 shadow-2xl border border-white/40">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 heading-display">Filters & Search</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Events
                    </div>
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field"
                    placeholder="Title or location..."
                  />
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status Filter
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(EventStatus).map(status => (
                      <label key={status} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={statusFilter.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStatusFilter([...statusFilter, status]);
                            } else {
                              setStatusFilter(statusFilter.filter(s => s !== status));
                            }
                          }}
                          className="sr-only"
                        />
                        <span className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          statusFilter.includes(status)
                            ? status === EventStatus.PUBLISHED
                              ? 'bg-green-500 text-white shadow-lg'
                              : status === EventStatus.DRAFT
                              ? 'bg-yellow-500 text-white shadow-lg'
                              : 'bg-red-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Location Filter
                    </div>
                  </label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="input-field"
                    placeholder="City, venue, or address..."
                  />
                </div>
                
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Sort By
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 input-field text-sm"
                    >
                      <option value="startAt">Date</option>
                      <option value="title">Title</option>
                      <option value="updatedAt">Updated</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                    >
                      <svg className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${
                        sortOrder === 'desc' ? 'rotate-180' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Active filters display */}
              {(searchTerm || statusFilter.length > 0 || locationFilter) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-sm font-semibold text-gray-600">Active filters:</span>
                    {searchTerm && (
                      <span className="status-badge status-published">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {statusFilter.map(status => (
                      <span key={status} className={`status-badge ${
                        status === EventStatus.PUBLISHED ? 'status-published' :
                        status === EventStatus.DRAFT ? 'status-draft' : 'status-cancelled'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {status}
                      </span>
                    ))}
                    {locationFilter && (
                      <span className="status-badge status-draft">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Location: {locationFilter}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setStatusFilter([]);
                        setLocationFilter('');
                        setSearchTerm('');
                      }}
                      className="btn-ghost text-sm font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="glass-card-intense rounded-3xl p-16 text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full mx-auto animate-spin animation-delay-75"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-pink-400 rounded-full mx-auto animate-spin animation-delay-150"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Loading Events</h3>
                <p className="text-gray-600 text-lg mb-6">Please wait while we fetch your events</p>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            ) : error ? (
              <div className="glass-card-intense rounded-3xl p-10 border-l-4 border-red-500 shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h3>
                    <p className="text-red-700 text-lg mb-6">{error}</p>
                    <button 
                      onClick={loadEvents}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="glass-card-intense rounded-3xl p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Events Found</h3>
                <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                  {(searchTerm || statusFilter.length > 0 || locationFilter) 
                    ? 'Try adjusting your search criteria or clearing filters to see more events'
                    : 'Create your first event to get started with event management'
                  }
                </p>
                {(searchTerm || statusFilter.length > 0 || locationFilter) ? (
                  <button
                    onClick={() => {
                      setStatusFilter([]);
                      setLocationFilter('');
                      setSearchTerm('');
                    }}
                    className="btn-secondary"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setShowForm(true);
                    }}
                    className="btn-primary"
                  >
                    Create Your First Event
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Events Count Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-12 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 heading-display mb-2">
                        {events.length} {events.length === 1 ? 'Event' : 'Events'}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {(searchTerm || statusFilter.length > 0 || locationFilter) 
                          ? 'matching your criteria'
                          : 'currently managed'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">Real-time updates</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                
                {/* Events Grid with Enhanced Status Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {events.map((event, index) => (
                    <div key={event.id} className="group">
                      <div className="hover-lift">
                        <EventCard
                          event={event}
                          onEdit={handleEditClick}
                          showPrivateFields={true}
                        />
                      </div>
                      
                      {/* Enhanced Status Control Buttons */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {event.status === EventStatus.DRAFT && (
                          <>
                            <button
                              onClick={() => handleStatusChange(event, EventStatus.PUBLISHED)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Publish
                            </button>
                            <button
                              onClick={() => handleStatusChange(event, EventStatus.CANCELLED)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </button>
                          </>
                        )}
                        {event.status === EventStatus.PUBLISHED && (
                          <button
                            onClick={() => handleStatusChange(event, EventStatus.CANCELLED)}
                            className="col-span-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Event
                          </button>
                        )}
                        {event.status === EventStatus.CANCELLED && (
                          <button
                            onClick={() => handleStatusChange(event, EventStatus.PUBLISHED)}
                            className="col-span-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reactivate Event
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
