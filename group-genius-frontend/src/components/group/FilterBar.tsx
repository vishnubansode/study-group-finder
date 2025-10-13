import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  courseOptions: string[];
  course: string;
  onCourse: (v: string) => void;
  privacy: 'All' | 'public' | 'private';
  onPrivacy: (v: 'All' | 'public' | 'private') => void;
  onReset?: () => void;
}

export default function FilterBar({
  search,
  onSearch,
  courseOptions,
  course,
  onCourse,
  privacy,
  onPrivacy,
  onReset,
}: FilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by group name"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Course Filter */}
        <Select value={course} onValueChange={onCourse}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courseOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Privacy Filter */}
        <Select
          value={privacy}
          onValueChange={(v: 'All' | 'public' | 'private') => onPrivacy(v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select privacy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
