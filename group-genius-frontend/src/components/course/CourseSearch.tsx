import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { CourseSearchParams } from '@/types/course';

interface CourseSearchProps {
  onSearch: (params: CourseSearchParams) => void;
  isLoading?: boolean;
  totalResults?: number;
  placeholder?: string;
}

export function CourseSearch({ 
  onSearch, 
  isLoading = false, 
  totalResults = 0,
  placeholder = "Search courses by code or name..." 
}: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('courseName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (newQuery?: string) => {
    const searchQuery = newQuery !== undefined ? newQuery : query;
    onSearch({
      query: searchQuery || undefined,
      sortBy: sortBy as any,
      sortDirection, // Changed from sortDir to sortDirection
      page: 0, // Reset to first page on new search
    });
  };

  const handleSearchClick = () => {
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    handleSearch('');
  };

  const toggleSort = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newSortDirection);
    onSearch({
      query: query || undefined,
      sortBy: sortBy as any,
      sortDirection: newSortDirection, // Changed from sortDir to sortDirection
      page: 0,
    });
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onSearch({
      query: query || undefined,
      sortBy: newSortBy as any,
      sortDirection, // Changed from sortDir to sortDirection
      page: 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-10 pr-10"
            disabled={isLoading}
            aria-label="Search courses"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          
          <Button
            onClick={handleSearchClick}
            disabled={isLoading}
            className="gap-2 min-w-[100px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div 
          id="advanced-filters"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30"
          role="region"
          aria-label="Advanced search filters"
        >
          <div className="space-y-2">
            <label htmlFor="sort-by" className="text-sm font-medium">
              Sort by
            </label>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger id="sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="courseCode">Course Code</SelectItem>
                <SelectItem value="courseName">Course Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort Direction</label>
            <Button
              variant="outline"
              onClick={toggleSort}
              className="w-full justify-start gap-2"
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium">Results</label>
            <div className="flex items-center gap-2 h-10">
              <Badge variant="secondary" className="text-sm" aria-live="polite">
                {totalResults} course{totalResults !== 1 ? 's' : ''}
              </Badge>
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="text-xs"
                >
                  Clear search
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {query && (
        <div 
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>
            {isLoading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
          </span>
          {query && (
            <span>
              for "{query}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}