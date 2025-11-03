import GroupCard from '@/components/group/GroupCard';

export default function GroupCardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">New GroupCard Design</h1>
        <p className="text-muted-foreground mb-8">Demo of the redesigned group cards</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Public Group Example */}
          <GroupCard
            name="Tech Innovators"
            description="Collaborative group for CS projects and innovation discussions"
            course="Introduction to Computer Science"
            privacy="public"
            members={2}
            maxMembers={10}
            onJoin={() => alert('Join clicked!')}
            joinDisabled={false}
          />

          {/* Private Group Example */}
          <GroupCard
            name="Advanced Mathematics Study Circle"
            description="Deep dive into calculus, linear algebra, and mathematical proofs. Weekly problem-solving sessions."
            course="Advanced Mathematics"
            privacy="private"
            members={5}
            maxMembers={8}
            onJoin={(password) => alert(`Join with password: ${password}`)}
            onRequest={() => alert('Request to join sent!')}
            joinDisabled={false}
          />

          {/* Public Group - Nearly Full */}
          <GroupCard
            name="Physics Lab Partners"
            description="Group for physics lab assignments and exam preparation"
            course="General Physics I"
            privacy="public"
            members={18}
            maxMembers={20}
            onJoin={() => alert('Join clicked!')}
            joinDisabled={false}
          />

          {/* Private Group - Full */}
          <GroupCard
            name="Chemistry Research Team"
            description="Exclusive research group focused on organic chemistry experiments and analysis"
            course="Organic Chemistry II"
            privacy="private"
            members={12}
            maxMembers={12}
            onJoin={(password) => alert(`Join with password: ${password}`)}
            onRequest={() => alert('Request to join sent!')}
            joinDisabled={true}
          />

          {/* Public Group - Small */}
          <GroupCard
            name="History Book Club"
            description="Discussing historical events and their modern implications"
            course="World History"
            privacy="public"
            members={3}
            maxMembers={15}
            onJoin={() => alert('Join clicked!')}
            joinDisabled={false}
          />

          {/* Private Group Example 2 */}
          <GroupCard
            name="Data Science Warriors"
            description="Machine learning, data analysis, and AI project collaboration for advanced students"
            course="Data Science Fundamentals"
            privacy="private"
            members={7}
            maxMembers={10}
            onJoin={(password) => alert(`Join with password: ${password}`)}
            onRequest={() => alert('Request to join sent!')}
            joinDisabled={false}
          />
        </div>
      </div>
    </div>
  );
}
