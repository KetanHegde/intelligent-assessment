import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const LocationSelector = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Fetch suggestions from the API
  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/locations', {
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

  // Handle selecting a suggestion
  const handleSuggestionClick = (locationName) => {
    setSelectedLocation(locationName);
    setQuery(locationName);
    setIsDropdownOpen(false);
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
    <div 
      ref={containerRef} 
      className="relative w-full max-w-md mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          placeholder="Search locations..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {isDropdownOpen && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((location) => (
              <li
                key={location._id}
                onClick={() => handleSuggestionClick(location.name)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md"
              >
                <div className="flex justify-between">
                  <span>{location.name}</span>
                  <span className="text-gray-500 text-sm">Location</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedLocation && (
        <p className="mt-2 text-sm text-gray-600">
          Selected Location: <span className="font-semibold">{selectedLocation}</span>
        </p>
      )}
    </div>
  );
};

export default LocationSelector;