import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Check, X, ChevronDown } from 'lucide-react';

const MultiSelectStudentSelector = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch suggestions from the API
  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/students', {
        params: { q: searchQuery },
      });
      setSuggestions(response.data);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  // Toggle student selection
  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => 
      prev.some(s => s._id === student._id)
        ? prev.filter(s => s._id !== student._id)
        : [...prev, student]
    );
  };

  // Select all students
  const handleSelectAll = () => {
    if (selectedStudents.length === suggestions.length) {
      // If all are already selected, deselect all
      setSelectedStudents([]);
    } else {
      // Select all current suggestions
      setSelectedStudents([...suggestions]);
    }
  };

  // Remove a selected student
  const removeStudent = (studentToRemove) => {
    setSelectedStudents(prev => 
      prev.filter(student => student._id !== studentToRemove._id)
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <div 
      ref={containerRef} 
      className="w-full max-w-md mx-auto relative"
    > 
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
        {/* Selected Students Display */}
        <div className="flex flex-wrap gap-2 p-2">
          {selectedStudents.map(student => (
            <div 
              key={student._id} 
              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {student.Name} - {student.USN}
              <button 
                onClick={() => removeStudent(student)}
                className="ml-2 hover:text-blue-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students by name, USN, or email..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
            className="flex-grow min-w-[100px] px-2 py-1 outline-none"
          />

          {/* Dropdown Toggle */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2 hover:bg-gray-100 rounded"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Dropdown */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Select All Option */}
            <div 
              onClick={handleSelectAll}
              className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
            >
              <span>Select All</span>
              {selectedStudents.length === suggestions.length && (
                <Check size={20} className="text-green-500" />
              )}
            </div>
            <hr />

            {/* Student Suggestions */}
            {suggestions.map((student) => (
              <div
                key={student._id}
                onClick={() => toggleStudentSelection(student)}
                className="px-4 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="mr-2 font-medium">{student.Name}</span>
                    <span className="text-gray-500 text-sm">{student.USN}</span>
                  </div>
                  <span className="text-xs text-gray-500">{student.Email}</span>
                </div>
                {selectedStudents.some(s => s._id === student._id) && (
                  <Check size={20} className="text-green-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional: Show selected students count */}
      {selectedStudents.length > 0 && (
        <p className="mt-2 text-sm text-gray-600">
          {selectedStudents.length} student(s) selected
        </p>
      )}
    </div>
    </>
  );
};

export default MultiSelectStudentSelector;

