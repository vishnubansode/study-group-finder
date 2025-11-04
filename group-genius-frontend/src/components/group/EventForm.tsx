import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  Tag, 
  X, 
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { groupAPI, tokenService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Group {
  id: number;
  name: string;
  course: string;
  description: string;
  members: number;
  maxMembers: number;
  privacy: 'public' | 'private';
}

export interface EventFormData {
  title: string;
  description: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  groupId: number | undefined;
}

interface EventFormProps {
  onSubmit: (data: EventFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<EventFormData>;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export default function EventForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  submitLabel = 'Create Session',
  cancelLabel = 'Cancel',
}: EventFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || undefined,
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    groupId: initialData?.groupId || undefined,
  });

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      const token = tokenService.getToken();
      if (!token) return;

      try {
        setIsLoadingGroups(true);
        const response = await groupAPI.getAllGroups(token);
        setGroups(response || []);
      } catch (err) {
        console.error('Failed to load groups:', err);
        setGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime.trim()) {
      newErrors.endTime = 'End time is required';
    }

    // Validate that end time is after start time
    if (formData.startTime && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      
      if (endTotal <= startTotal) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!formData.groupId) {
      newErrors.groupId = 'Please select a group';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof EventFormData, value: string | Date | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const selectedGroup = groups.find(g => g.id === formData.groupId);
  const duration = formData.startTime && formData.endTime 
    ? (() => {
        const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        const durationMinutes = endTotal - startTotal;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim() : `${minutes}m`;
      })()
    : null;

  return (
    <div className="w-full">
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Schedule Study Session
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Create a new study session and link it to your group
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Selection - Featured First */}
        <div className="space-y-2">
          <Label htmlFor="group" className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Study Group <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.groupId?.toString() || ''}
            onValueChange={(value) => handleInputChange('groupId', parseInt(value))}
            disabled={isLoading || isLoadingGroups}
          >
            <SelectTrigger 
              className={cn(
                "h-12 text-base transition-all duration-200",
                errors.groupId && "border-destructive focus-visible:ring-destructive ring-destructive"
              )}
            >
              <SelectValue placeholder={isLoadingGroups ? "Loading groups..." : "Select a study group"} />
            </SelectTrigger>
            <SelectContent>
              {groups.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No groups available. Join a group first to create sessions.
                </div>
              ) : (
                groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    <div className="flex items-center gap-2 py-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{group.name}</span>
                        <span className="text-xs text-muted-foreground">{group.course}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedGroup && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground font-medium">{selectedGroup.name}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedGroup.course}
              </Badge>
            </div>
          )}
          {errors.groupId && (
            <p className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.groupId}
            </p>
          )}
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Session Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Chapter 5 Review Session, Midterm Prep, Group Discussion"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={cn(
              "h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20",
              errors.title && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isLoading}
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            {errors.title ? (
              <p className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in">
                <X className="h-3.5 w-3.5" />
                {errors.title}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="What will you study? Add any topics, materials, or goals for this session. Be specific to help your group members prepare..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={cn(
              "min-h-[120px] resize-none text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20",
              errors.description && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isLoading}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in">
                <X className="h-3.5 w-3.5" />
                {errors.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Date <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal text-base transition-all duration-200",
                  !formData.date && "text-muted-foreground",
                  errors.date && "border-destructive focus-visible:ring-destructive ring-destructive"
                )}
                disabled={isLoading}
                type="button"
              >
                <CalendarIcon className="mr-3 h-4 w-4" />
                {formData.date ? (
                  <span className="font-medium">{format(formData.date, 'EEEE, MMMM d, yyyy')}</span>
                ) : (
                  'Pick a date for your session'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => handleInputChange('date', date)}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Time Range - Start and End */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Session Time <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-xs text-muted-foreground font-medium">
                Start Time
              </Label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={cn(
                    "h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.startTime && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.startTime && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="h-3 w-3" />
                  {errors.startTime}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-xs text-muted-foreground font-medium">
                End Time
              </Label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={cn(
                    "h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.endTime && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={isLoading}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.endTime && (
                <p className="text-xs text-destructive flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {duration && formData.startTime && formData.endTime && !errors.endTime && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 animate-in fade-in">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Duration: <span className="text-primary">{duration}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto h-11 text-base"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || isLoadingGroups}
            className="w-full sm:w-auto sm:ml-auto h-11 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
