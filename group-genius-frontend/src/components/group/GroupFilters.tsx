import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface GroupFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  courseOptions: string[];
  selectedCourse: string;
  onCourseChange: (v: string) => void;
  selectedPrivacy: 'All' | 'public' | 'private';
  onPrivacyChange: (v: 'All' | 'public' | 'private') => void;
}

export default function GroupFilters(props: GroupFiltersProps) {
  const {
    searchQuery,
    onSearchQueryChange,
    courseOptions,
    selectedCourse,
    onCourseChange,
    selectedPrivacy,
    onPrivacyChange,
  } = props;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search groups, courses, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedCourse} onValueChange={onCourseChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {courseOptions.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* FIX: removed 'any' type cast safely */}
        <Select value={selectedPrivacy} onValueChange={(v: string) => onPrivacyChange(v as 'All' | 'public' | 'private')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All privacy</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>
    </div>
  );
}
