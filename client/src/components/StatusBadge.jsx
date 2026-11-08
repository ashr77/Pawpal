export default function StatusBadge({ status }) {
  let badgeClass = 'bg-secondary';
  if (status === 'Active') badgeClass = 'bg-primary';
  else if (status === 'In Progress') badgeClass = 'bg-warning text-dark';
  else if (status === 'Resolved') badgeClass = 'bg-success';

  return (
    <span className={`badge ${badgeClass} px-2 py-1`}>
      {status || 'Active'}
    </span>
  );
}
