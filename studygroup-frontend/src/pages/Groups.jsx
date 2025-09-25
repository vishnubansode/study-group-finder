import { useGroups } from '../context/GroupContext'

export default function Groups() {
  const { groups, loading, refresh } = useGroups()

  if (loading) return <div>Loading groups...</div>

  return (
    <div>
      <h2>Groups</h2>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {groups.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  )
}
