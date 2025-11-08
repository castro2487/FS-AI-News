import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { DateRangePicker } from '../molecules/DateRangePicker';
import { EventFilters } from '@/types/event.types';

export interface FilterPanelProps {
  filters: EventFilters;
  isAdmin: boolean;
  onFiltersChange: (filters: EventFilters) => void;
  onClear: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  isAdmin,
  onFiltersChange,
  onClear,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DateRangePicker
          dateFrom={filters.dateFrom || ''}
          dateTo={filters.dateTo || ''}
          onDateFromChange={(value) => onFiltersChange({ ...filters, dateFrom: value })}
          onDateToChange={(value) => onFiltersChange({ ...filters, dateTo: value })}
        />

        <FormField
          label="Location"
          type="text"
          value={filters.locations || ''}
          onChange={(e) => onFiltersChange({ ...filters, locations: e.target.value })}
          placeholder="e.g., New York, Boston"
        />

        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onClear} className="mt-4">
        Clear Filters
      </Button>
    </div>
  );
};