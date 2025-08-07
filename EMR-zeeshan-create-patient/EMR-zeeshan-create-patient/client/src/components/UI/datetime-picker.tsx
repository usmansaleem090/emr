import React from 'react';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDateTime?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  minDateTime,
  className
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [timeValue, setTimeValue] = React.useState(
    value ? format(new Date(value), 'HH:mm') : '09:00'
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Combine date with current time
    const [hours, minutes] = timeValue.split(':');
    const newDateTime = new Date(date);
    newDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    // Format as ISO string for datetime-local input compatibility
    const isoString = newDateTime.toISOString().slice(0, 16);
    onChange(isoString);
    
    setIsOpen(false);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    
    if (selectedDate) {
      const [hours, minutes] = time.split(':');
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const isoString = newDateTime.toISOString().slice(0, 16);
      onChange(isoString);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    return format(date, 'PPP p'); // e.g., "Dec 25, 2023 at 2:30 PM"
  };

  const getMinDate = () => {
    if (!minDateTime) return undefined;
    return new Date(minDateTime);
  };

  return (
    <div className={cn("flex space-x-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const minDate = getMinDate();
              if (minDate && date < minDate) return true;
              return date < new Date(new Date().setHours(0, 0, 0, 0));
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center space-x-2 min-w-[120px]">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
}