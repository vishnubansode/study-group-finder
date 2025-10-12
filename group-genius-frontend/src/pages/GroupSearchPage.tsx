import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FilterBar from '@/components/group/FilterBar';
import GroupCard from '@/components/group/GroupCard';
import Loader from '@/components/common/Loader';

type Privacy = 'public' | 'private';

interface Item {
  id: number;
  name: string;
  description: string;
  course: string;
  privacy: Privacy;
  members?: number;
  maxMembers?: number;
}

// UI-only stubbed data; replace with GET /groups when wiring
const STUB: Item[] = [
  { id: 1, name: 'CS101 Study Buddies', description: 'Weekly problem-solving sessions.', course: 'CS101', privacy: 'public', members: 8, maxMembers: 12 },
  { id: 2, name: 'Algorithms Masters', description: 'Deep dive into DSA.', course: 'CS201', privacy: 'private', members: 5, maxMembers: 10 },
];

export default function GroupSearchPage() {
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('All Courses');
  const [privacy, setPrivacy] = useState<'All' | Privacy>('All');
  const [loading] = useState(false);

  const courseOptions = useMemo(() => ['All Courses', 'CS101', 'CS201', 'MATH101'], []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STUB.filter((g) => {
      const mSearch = !q || g.name.toLowerCase().includes(q);
      const mCourse = course === 'All Courses' || g.course === course;
      const mPrivacy = privacy === 'All' || g.privacy === privacy;
      return mSearch && mCourse && mPrivacy;
    });
  }, [search, course, privacy]);

  const handleReset = () => {
    setSearch('');
    setCourse('All Courses');
    setPrivacy('All');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <FilterBar
            search={search}
            onSearch={setSearch}
            courseOptions={courseOptions}
            course={course}
            onCourse={setCourse}
            privacy={privacy}
            onPrivacy={setPrivacy}
            onReset={handleReset}
          />
        </CardContent>
      </Card>

      {loading ? (
        <Loader label="Loading groups..." />
      ) : filtered.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((g) => (
            <GroupCard
              key={g.id}
              name={g.name}
              description={g.description}
              course={g.course}
              privacy={g.privacy}
              members={g.members}
              maxMembers={g.maxMembers}
              joinDisabled
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">No groups found</div>
      )}
    </div>
  );
}


