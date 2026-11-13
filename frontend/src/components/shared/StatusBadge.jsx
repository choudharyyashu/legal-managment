import React from 'react';
import { Badge } from '../ui/Badge';

export function StatusBadge({ status, type = 'general' }) {
  if (!status) return <Badge variant="default">—</Badge>;

  // Mapping based on common legal management statuses
  const normalized = status.toLowerCase();

  let variant = 'default';

  if (
    normalized.includes('overdue') ||
    normalized.includes('rejected') ||
    normalized.includes('conflict identified') ||
    normalized.includes('cancelled') ||
    normalized.includes('escalated') ||
    normalized.includes('action required')
  ) {
    variant = 'danger';
  } else if (
    normalized.includes('unmatched') ||
    normalized.includes('uncertain') ||
    normalized.includes('pending') ||
    normalized.includes('in review') ||
    normalized.includes('submitted') ||
    normalized.includes('waiting') ||
    normalized.includes('in progress') ||
    normalized.includes('partially paid') ||
    normalized.includes('trial prep') ||
    normalized.includes('discovery') ||
    normalized.includes('idle') ||
    normalized.includes('overlap') ||
    normalized.includes('triggered') ||
    normalized.includes('due soon') ||
    normalized.includes('scheduled') ||
    normalized.includes('monitoring')
  ) {
    variant = 'warning';
  } else if (
    normalized === 'reviewed' ||
    normalized.includes('marked reviewed') ||
    normalized.includes('exported')
  ) {
    variant = 'info';
  } else if (
    normalized.includes('inactive') ||
    normalized.includes('not started') ||
    normalized.includes('draft') ||
    normalized.includes('sent') ||
    normalized.includes('previous') ||
    normalized.includes('archived') ||
    normalized.includes('dismissed')
  ) {
    variant = 'default';
  } else if (
    normalized.includes('active') ||
    normalized.includes('cleared') ||
    normalized.includes('completed') ||
    normalized.includes('approved') ||
    normalized.includes('paid') ||
    normalized.includes('synchronized') ||
    normalized.includes('matched') ||
    normalized.includes('current') ||
    normalized.includes('resolved') ||
    normalized.includes('on track')
  ) {
    variant = 'success';
  }

  return (
    <Badge variant={variant} size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70 inline-block" />
      {status}
    </Badge>
  );
}

