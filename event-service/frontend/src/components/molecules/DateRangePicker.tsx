import React from 'react';
import { FormField } from './FormField';

export interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Date From"
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
      />
      <FormField
        label="Date To"
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
      />
    </div>
  );
};