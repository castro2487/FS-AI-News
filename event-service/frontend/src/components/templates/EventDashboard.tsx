import React, { useState } from 'react';
import { Eye, EyeOff, Plus, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../atoms/Button';
import { FilterPanel } from '../organisms/FilterPanel';
import { EventList } from '../organisms/EventList';
import { EventForm } from '../organisms/EventForm';
import { AuthModal } from '../organisms/AuthModal';
import { SearchBar } from '../molecules/SearchBar';
import { Event, PublicEvent, EventFilters, EventStatus, CreateEventDTO, User } from '@/types/event.types';

export interface EventDashboardProps {
  events: (Event | PublicEvent)[];
  loading: boolean;
  isAdmin: boolean;
  filters: EventFilters;
  pagination: {
    page: number;
    totalPages: number;
  };
  // New props for integration
  searchQuery?: string;
  user?: User | null;
  isAuthenticated?: boolean;
  showAuthModal?: boolean;
  authMode?: 'login' | 'register';
  // Callbacks
  onToggleView: () => void;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onCreateEvent: (data: CreateEventDTO) => Promise<void>;
  onUpdateStatus: (id: string, status: EventStatus) => Promise<void>;
  // New callbacks
  onSearch?: (query: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
  onCloseAuthModal?: () => void;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({
  events,
  loading,
  isAdmin,
  filters,
  pagination,
  searchQuery = '',
  user = null,
  isAuthenticated = false,
  showAuthModal = false,
  authMode = 'login',
  onToggleView,
  onFiltersChange,
  onClearFilters,
  onPageChange,
  onCreateEvent,
  onUpdateStatus,
  onSearch,
  onLogin,
  onRegister,
  onLogout,
  onCloseAuthModal,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Service</h1>
              <p className="text-sm text-gray-600 mt-1">
                {isAdmin ? 'Admin Dashboard' : 'Public Events'}
                {isAuthenticated && user && (
                  <span className="ml-2 text-blue-600">• {user.name || user.email}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Toggle Admin/Public View */}
              <Button variant="secondary" size="md" onClick={onToggleView}>
                {isAdmin ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isAdmin ? 'Public View' : 'Admin View'}
              </Button>

              {/* Auth Section */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    {user.name || 'Profile'}
                  </Button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role: <span className="font-medium">{user.role}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="secondary" size="md" onClick={onLogin}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button variant="primary" size="md" onClick={onRegister}>
                    Register
                  </Button>
                </>
              )}

              {/* Create Event (Admin only or authenticated users) */}
              {(isAdmin || isAuthenticated) && (
                <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        {onSearch && (
          <div className="mb-6">
            <SearchBar onSearch={onSearch} placeholder="Search events by title or location..." />
            {searchQuery && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  Searching for: <span className="font-medium">{searchQuery}</span>
                </p>
                <button
                  onClick={() => onSearch('')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          isAdmin={isAdmin}
          onFiltersChange={onFiltersChange}
          onClear={onClearFilters}
        />

        {/* Event List */}
        <EventList
          events={events}
          loading={loading}
          isAdmin={isAdmin}
          pagination={pagination}
          onPageChange={onPageChange}
          onUpdateStatus={onUpdateStatus}
        />
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <EventForm
          onSubmit={onCreateEvent}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && onCloseAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={onCloseAuthModal}
          defaultMode={authMode}
        />
      )}
    </div>
  );
};