/**
 * Public Events Page
 * Displays published events with AI summaries
 * Features a stunning, modern design with glass morphism and animations
 */

'use client';

import { useState, useEffect } from 'react';
import { PublicEvent } from '../../lib/types';
import { apiClient } from '../lib/api';
import EventCard from '../components/EventCard';
import EventSummaryModal from '../components/EventSummaryModal';

export default function HomePage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [locationFilter]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (locationFilter) filters.locations = [locationFilter];

      const result = await apiClient.getPublicEvents(filters);
      setEvents(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    searchTerm === '' || 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(term.length > 0);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <header className="relative hero-gradient text-white overflow-hidden">
        {/* Enhanced Glass Morphism Overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        <div className="absolute inset-0 glass-morphism-overlay"></div>
        
        {/* Floating decorative shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl float-animation"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl float-animation animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl float-animation animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Glass morphism container for content */}
          <div className="glass-card-intense rounded-3xl p-12 md:p-16 mx-4 backdrop-blur-md bg-white/5 border-white/20">
            <div className="text-center">
            {/* Main heading with animation */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl heading-display mb-6 text-shadow-lg">
                <span className="inline-block gradient-text animate-in slide-in-from-bottom-4 duration-1000">
                  Event
                </span>
                <br />
                <span className="inline-block gradient-text text-shadow-lg animate-in slide-in-from-bottom-4 duration-1000 animation-delay-500">
                  Service
                </span>
              </h1>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Discover amazing events with{' '}
              <span className="font-semibold text-yellow-300">AI-powered insights</span>
              {' '}and{' '}
              <span className="font-semibold text-cyan-300">real-time summaries</span>
              {' '}in a beautiful, professional platform
            </p>
            
            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <a
                href="/admin"
                className="group relative overflow-hidden px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-300 hover:rotate-1"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Admin Dashboard
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </a>
              
              <div className="flex items-center gap-3 text-white/80">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Secure authentication required</span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="glass-card-intense rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Real-time</h3>
                <p className="text-gray-600">Live updates & notifications</p>
              </div>
              
              <div className="glass-card-intense rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">AI-Powered</h3>
                <p className="text-gray-600">Intelligent event summaries</p>
              </div>
              
              <div className="glass-card-intense rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Global</h3>
                <p className="text-gray-600">Events worldwide</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Enhanced Search and Filter Section */}
        <div className="glass-card-intense rounded-3xl p-10 mb-16 shadow-2xl border border-white/40">
          <div className="flex flex-col lg:flex-row gap-8 items-end">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Events
                </div>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-field pl-14 pr-6 py-4 text-lg font-medium placeholder-gray-400"
                  placeholder="Search by event name or location..."
                />
                <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isSearching && (
                  <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Location Filter */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Filter by Location
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="input-field pl-6 pr-12 py-4 text-lg"
                  placeholder="City, venue, or address..."
                />
                <svg className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
            
            {/* Clear Button */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setLocationFilter('');
                  setSearchTerm('');
                }}
                className="btn-secondary flex items-center gap-3 px-8 py-4 font-semibold text-lg rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Active filters display */}
          {(searchTerm || locationFilter) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
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
                {locationFilter && (
                  <span className="status-badge status-draft">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Location: {locationFilter}
                  </span>
                )}
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Discovering Amazing Events</h3>
            <p className="text-gray-600 text-lg mb-6">Please wait while we curate the best events for you</p>
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
                <p className="text-red-700 text-lg">{error}</p>
                <button 
                  onClick={loadEvents}
                  className="mt-6 btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="glass-card-intense rounded-3xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {searchTerm || locationFilter ? 'No matching events found' : 'No events available'}
            </h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              {searchTerm || locationFilter 
                ? 'Try adjusting your search criteria or clearing filters to see more events'
                : 'There are no events to show at the moment. Check back later for exciting upcoming events'
              }
            </p>
            {(searchTerm || locationFilter) && (
              <button
                onClick={() => {
                  setLocationFilter('');
                  setSearchTerm('');
                }}
                className="btn-secondary"
              >
                Clear All Filters
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
                    {filteredEvents.length} {filteredEvents.length === 1 ? 'Amazing Event' : 'Amazing Events'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {searchTerm || locationFilter ? 'matching your criteria' : 'currently available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Live updates enabled</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="transform hover:scale-105 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <EventCard
                    event={event}
                    onViewSummary={setSelectedEvent}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {selectedEvent && (
        <EventSummaryModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Enhanced Modern Footer */}
      <footer className="mt-24 relative">
        <div className="glass-card-intense rounded-t-[3rem] border-t-0 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              {/* Logo and branding */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold gradient-text heading-display">Event Service</h3>
                  <p className="text-gray-600 font-medium">Professional Event Management Platform</p>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
                Experience the future of event management with our AI-powered platform. 
                Create, discover, and manage events with intelligent insights and real-time updates.
              </p>
            </div>
            
            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Lightning Fast</h4>
                <p className="text-gray-600 text-sm">Instant loading and real-time updates</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">AI-Powered</h4>
                <p className="text-gray-600 text-sm">Intelligent event summaries and insights</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Secure</h4>
                <p className="text-gray-600 text-sm">Enterprise-grade security and privacy</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">User-Friendly</h4>
                <p className="text-gray-600 text-sm">Intuitive design for effortless use</p>
              </div>
            </div>
            
            {/* Bottom section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Powered by MiniMax Agent
                  </span>
                  <span>•</span>
                  <span>Built with Next.js & TypeScript</span>
                  <span>•</span>
                  <span>AI-Enhanced Experience</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">Follow us:</span>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
