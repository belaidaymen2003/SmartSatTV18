import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-left flex items-center justify-between hover:border-white/20 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {selected.length > 0 ? (
            selected.map((item) => (
              <span
                key={item}
                className="bg-orange-500/30 text-orange-200 px-2 py-1 rounded text-xs inline-flex items-center gap-1"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(item);
                  }}
                  className="hover:text-orange-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-white/50">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/60 border border-white/10 rounded shadow-lg z-10 backdrop-blur-md">
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 hover:text-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="w-4 h-4 rounded border border-white/20 bg-black/40 accent-orange-500 cursor-pointer"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
