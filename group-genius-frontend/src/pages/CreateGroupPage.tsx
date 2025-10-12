import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/common/FormInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loader from '@/components/common/Loader';
import { courseApi } from '@/lib/api/courseApi';
import { useAuth } from '@/contexts/AuthContext';

type Privacy = 'public' | 'private';

export default function CreateGroupPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fetchEnrolledCourses = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingCourses(true);
    try {
      const courses = await courseApi.getUserCourses();
      const courseNames = courses.map(course => course.courseName || course.courseCode);
      setEnrolledCourses(courseNames);
      
      // Set first course as default if available
      if (courseNames.length > 0 && !course) {
        setCourse(courseNames[0]);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user, course]);

  // Fetch enrolled courses on component mount
  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user, fetchEnrolledCourses]);

  const errors = useMemo(() => {
    return {
      name: !name.trim() ? 'Group Name is required' : name.trim().length < 3 ? 'Minimum 3 characters' : '',
      description: !description.trim() ? 'Description is required' : '',
      course: !course ? 'Course is required' : '',
      privacy: !privacy ? 'Privacy is required' : '',
      password: privacy === 'private' && !password.trim() ? 'Password is required for private groups' : '',
    };
  }, [name, description, course, privacy, password]);

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setTouched({ name: true, description: true, course: true, privacy: true, password: true });
    if (hasErrors) return;
    // UI only: simulate submission
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      // In real wiring, show toast.success
      alert('Group created (UI only)');
      setName('');
      setDescription('');
      setCourse('');
      setPrivacy('public');
      setPassword('');
      setTouched({});
    }, 800);
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setCourse('');
    setPrivacy('public');
    setPassword('');
    setTouched({});
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>Create Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormInput
            label="Group Name"
            placeholder="e.g., CS101 Exam Prep"
            value={name}
            onChange={(v) => setName(v)}
            error={touched.name ? errors.name : ''}
            required
          />

          <FormInput
            label="Description"
            placeholder="What is this group about?"
            value={description}
            onChange={(v) => setDescription(v)}
            error={touched.description ? errors.description : ''}
            type="textarea"
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Course <span className="text-destructive">*</span></label>
            <Select value={course} onValueChange={setCourse} disabled={isLoadingCourses}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} />
              </SelectTrigger>
              <SelectContent>
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-courses" disabled>
                    No enrolled courses found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {touched.course && errors.course ? (
              <p className="text-xs text-destructive">{errors.course}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Privacy <span className="text-destructive">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={privacy === 'public' ? 'default' : 'outline'}
                onClick={() => setPrivacy('public')}
              >
                Public
              </Button>
              <Button
                type="button"
                variant={privacy === 'private' ? 'default' : 'outline'}
                onClick={() => setPrivacy('private')}
              >
                Private
              </Button>
            </div>
            {touched.privacy && errors.privacy ? (
              <p className="text-xs text-destructive">{errors.privacy}</p>
            ) : null}
          </div>

          {/* Password field for private groups */}
          {privacy === 'private' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Group Password <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter password for private group"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Members will need this password to join the group
              </p>
              {touched.password && errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : null}
            </div>
          )}

          {submitting ? <Loader label="Creating group..." /> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={handleReset} disabled={submitting}>Reset</Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting || hasErrors}>Create Group</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


