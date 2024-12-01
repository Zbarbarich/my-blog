import { useState, useMemo, useCallback } from 'react';

export function useFilters(items) {
  // All useState hooks first
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    tags: []
  });
  const [availableTags, setAvailableTags] = useState(() => 
    [...new Set(items.flatMap(item => item.tags))].sort()
  );

  // All useCallback hooks next
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const addNewTag = useCallback((newTag) => {
    setAvailableTags(prev => {
      if (!prev.includes(newTag)) {
        const newTags = [...prev, newTag].sort();
        return newTags;
      }
      return prev;
    });
  }, []);

  // All useMemo hooks last
  const categories = useMemo(() => ['', ...new Set(items.map(item => item.category))], [items]);
  const authors = useMemo(() => ['', ...new Set(items.map(item => item.author))], [items]);

  const filteredItems = useMemo(() => {
    // Update available tags when filtering
    const currentPostTags = [...new Set(items.flatMap(item => item.tags))];
    setAvailableTags(prev => {
      const allTags = [...new Set([...prev, ...currentPostTags])].sort();
      return allTags;
    });

    return items.filter(item => {
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      if (filters.author && item.author !== filters.author) {
        return false;
      }
      if (filters.tags.length > 0 && !filters.tags.every(tag => item.tags.includes(tag))) {
        return false;
      }
      return true;
    });
  }, [items, filters]);

  return {
    filters,
    handleFilterChange,
    filteredItems,
    categories,
    authors,
    allTags: availableTags,
    addNewTag
  };
}