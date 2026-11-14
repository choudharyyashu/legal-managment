-- ==============================================================================
-- PROPOSAL: IDEMPOTENT PERMISSION SYNCHRONIZATION FOR DOCUMENT LIFECYCLE
-- Target Environment: Railway MySQL 8.4 LTS / Production / Staging
-- Status: UNEXECUTED PROPOSAL ONLY (Zero DB Modifications applied)
-- ==============================================================================

-- Grant documents:approve, documents:reject, and documents:send to attorney and supervisor roles
INSERT INTO role_permissions (id, role_id, permission_key, granted_at)
SELECT 
    UUID() AS id,
    r.id AS role_id,
    p.permission_key,
    NOW(3) AS granted_at
FROM roles r
CROSS JOIN (
    SELECT 'documents:approve' AS permission_key
    UNION ALL SELECT 'documents:reject'
    UNION ALL SELECT 'documents:send'
) p
WHERE r.id IN ('attorney', 'supervisor')
  AND NOT EXISTS (
      SELECT 1 
      FROM role_permissions rp 
      WHERE rp.role_id = r.id 
        AND rp.permission_key = p.permission_key
  );

-- Verify synchronization state:
-- SELECT r.id as role, rp.permission_key 
-- FROM roles r 
-- JOIN role_permissions rp ON r.id = rp.role_id 
-- WHERE rp.permission_key LIKE 'documents:%' 
-- ORDER BY r.id, rp.permission_key;
