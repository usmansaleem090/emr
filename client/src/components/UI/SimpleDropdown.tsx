import React, { useState, useRef, useEffect } from 'react';
import { Label } from "@/components/UI/label";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface SimpleDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  label?: string;
  className?: string;
}

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  label,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Only add the event listener when the dropdown is open
    if (isOpen) {
      // Use a longer delay to prevent interference with dialogs
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, { capture: false });
      }, 200);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside, { capture: false });
      };
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option: DropdownOption) => {
    console.log('SimpleDropdown selecting:', option);
    onValueChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
        >
          <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  option.value === value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 