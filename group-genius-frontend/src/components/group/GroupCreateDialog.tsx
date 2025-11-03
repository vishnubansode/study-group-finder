import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { courseApi } from '@/lib/api/courseApi';
import { useAuth } from '@/contexts/AuthContext';

export type GroupPrivacy = 'public' | 'private';

export interface GroupCreateValues {
  name: string;
  description: string;
  courseId?: number;
  privacy: GroupPrivacy;
  password?: string;
}

interface GroupCreateDialogProps {
  courseOptions?: string[];
  onCreate?: (values: GroupCreateValues) => void;
}

export function GroupCreateDialog({ courseOptions, onCreate }: GroupCreateDialogProps) {
  const { user } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [open, setOpen] = useState(false);
  // store courses as objects so we can pass back the id
  const [enrolledCourses, setEnrolledCourses] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [values, setValues] = useState<GroupCreateValues>({
    name: '',
    description: '',
    courseId: undefined,
    privacy: 'public',
    password: '',
  });

  // ✅ Wrapped in useCallback to remove ESLint dependency warning
  const fetchEnrolledCourses = useCallback(async () => {
    if (!user) return;
    setIsLoadingCourses(true);
    try {
      const courses = await courseApi.getUserCourses();
      const mapped = courses.map(course => ({ id: course.id, name: course.courseName || course.courseCode }));
      setEnrolledCourses(mapped);

      // set a sensible default courseId if none selected yet
      if (mapped.length > 0) {
        setValues(prev => (prev.courseId ? prev : { ...prev, courseId: mapped[0].id }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user]);

  // ✅ Fixed dependency warning by including fetchEnrolledCourses
  useEffect(() => {
    if (open && user) {
      fetchEnrolledCourses();
    }
  }, [open, user, fetchEnrolledCourses]);

  const isValid =
    values.name.trim().length > 0 &&
    (typeof values.courseId === 'number' && !Number.isNaN(values.courseId)) &&
    (values.privacy === 'public' || (values.privacy === 'private' && values.password?.trim().length > 0));

  const handleSubmit = () => {
    if (!isValid) return;
    onCreate?.(values);
    setOpen(false);
    setValues({ name: '', description: '', courseId: undefined, privacy: 'public', password: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-hero">
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create a New Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g., CS101 Exam Prep"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What is this group about?"
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select
                value={values.courseId ? String(values.courseId) : ''}
                onValueChange={(val) => setValues((v) => ({ ...v, courseId: val ? Number(val) : undefined }))}
                disabled={isLoadingCourses}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} />
                </SelectTrigger>
                <SelectContent>
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-courses" disabled>
                      No enrolled courses found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" /> Privacy
              </label>
              <Select
                value={values.privacy}
                onValueChange={(val: GroupPrivacy) => setValues((v) => ({ ...v, privacy: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {values.privacy === 'private' && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Group Password
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Enter password for private group"
                  value={values.password || ''}
                  onChange={(e) => {
                    const pw = e.target.value;
                    setValues((v) => ({ ...v, password: pw }));
                    // evaluate strength
                    let score = 0;
                    if (pw.length >= 8) score += 1;
                    if (/[A-Z]/.test(pw)) score += 1;
                    if (/[0-9]/.test(pw)) score += 1;
                    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
                    setPasswordStrength(score);
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2">
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    {values.password && values.password.length >= 8 ? (
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mt-1" />
                    )}
                    <span>Minimum 8 characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {/[A-Z]/.test(values.password || '') ? (
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mt-1" />
                    )}
                    <span>At least one uppercase letter (A-Z)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {/[0-9]/.test(values.password || '') ? (
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mt-1" />
                    )}
                    <span>At least one number (0-9)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    {/[^A-Za-z0-9]/.test(values.password || '') ? (
                      <Check className="w-4 h-4 text-green-600 mt-1" />
                    ) : (
                      <X className="w-4 h-4 text-red-600 mt-1" />
                    )}
                    <span>At least one special character (e.g. @#$%&*!^)</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Members will need this password to join the group
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GroupCreateDialog;
