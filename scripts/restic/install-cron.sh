#!/usr/bin/env bash
# ==============================================================================
# HEUGLY & BLUDWORTH - Installer for Restic Daily Backup Daemon / Cron
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x "${SCRIPT_DIR}/restic-backup.sh"

echo "Installing Heugly & Bludworth Restic Daily Encrypted Backup..."

# Method A: Systemd Timer (preferred on modern Linux)
if [ -d /etc/systemd/system ]; then
    echo "Configuring systemd service and timer..."
    cp "${SCRIPT_DIR}/legal-pro-restic.service" /etc/systemd/system/
    cp "${SCRIPT_DIR}/legal-pro-restic.timer" /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable --now legal-pro-restic.timer
    echo "✓ Systemd timer 'legal-pro-restic.timer' activated successfully (runs daily at 02:00 UTC)."
    systemctl status legal-pro-restic.timer --no-pager
else
    # Method B: Standard Cron (/etc/cron.d)
    echo "Configuring /etc/cron.d/legal-pro-restic..."
    cat << 'EOF' > /etc/cron.d/legal-pro-restic
# HEUGLY & BLUDWORTH - Automated Daily Encrypted Restic Backup (Utah RPC 1.6)
0 2 * * * root /opt/legal-pro/scripts/restic/restic-backup.sh >> /var/log/legal-pro-restic.log 2>&1
EOF
    chmod 0644 /etc/cron.d/legal-pro-restic
    echo "✓ Cron job configured in /etc/cron.d/legal-pro-restic (runs daily at 02:00 UTC)."
fi

echo "Automated Restic Backup installation complete."
