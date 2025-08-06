import { useState, useEffect } from "react";
 
export default function SearchInput({
  onSearch,
  delay = 300,
  placeholder = "Search...",
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);
 
    return () => clearTimeout(handler);
  }, [query, delay]);
 
  useEffect(() => {
    onSearch(debouncedQuery.trim());
  }, [debouncedQuery]);
 
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-3 py-2 w-full ${className}`}
    />
  );
}
 