import { useState, useMemo, useCallback, useEffect } from 'react';

export function useSearch(items, searchFields = ['title', 'content']) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const results = useMemo(() => {
    if (!debouncedTerm) return items;
    
    return items.filter(item =>
      searchFields.some(field =>
        item[field].toLowerCase().includes(debouncedTerm.toLowerCase())
      )
    );
  }, [items, debouncedTerm, searchFields]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term || '');
  }, []);

  return {
    searchTerm,
    handleSearch,
    results,
    isSearching: Boolean(searchTerm)
  };
}