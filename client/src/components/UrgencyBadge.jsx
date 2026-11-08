export default function UrgencyBadge({ urgency }) {
  let badgeClass = 'bg-secondary';
  if (urgency === 'Critical') badgeClass = 'bg-danger';
  else if (urgency === 'Urgent') badgeClass = 'bg-warning text-dark';
  else if (urgency === 'Normal') badgeClass = 'bg-info text-dark';

  return (
    <span className={`badge ${badgeClass} px-2 py-1`}>
      {urgency || 'Normal'}
    </span>
  );
}
