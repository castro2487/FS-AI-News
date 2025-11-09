'use client';

import { useState } from 'react';
import { EventDashboard } from '@/components/templates/EventDashboard';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { user, isAuthenticated, logout } = useAuth();

  const {
    events,
    loading,
    filters,
    pagination,
    createEvent,
    updateEventStatus,
    updateFilters,
    clearFilters,
    changePage,
    searchEvents,
  } = useEvents(isAdmin);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchEvents(query);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  return (
    <EventDashboard
      events={events}
      loading={loading}
      isAdmin={isAdmin}
      filters={filters}
      pagination={pagination}
      searchQuery={searchQuery}
      user={user}
      isAuthenticated={isAuthenticated}
      showAuthModal={showAuthModal}
      authMode={authMode}
      onToggleView={() => setIsAdmin(!isAdmin)}
      onFiltersChange={updateFilters}
      onClearFilters={clearFilters}
      onPageChange={changePage}
      onCreateEvent={createEvent}
      onUpdateStatus={updateEventStatus}
      onSearch={handleSearch}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onLogout={logout}
      onCloseAuthModal={() => setShowAuthModal(false)}
    />
  );
}