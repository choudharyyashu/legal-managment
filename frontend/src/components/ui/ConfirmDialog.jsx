import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' or 'primary'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div className={`p-2.5 rounded-full flex-shrink-0 ${
          variant === 'danger' ? 'bg-red-100 text-[#B42318]' : 'bg-[#F5F0E5] text-[#06244B]'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-[#202A35] leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

