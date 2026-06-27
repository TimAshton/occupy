// client/src/components/Notification.jsx
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import clsx from 'clsx';

const TYPE_STYLES = {
  info:  'bg-surface-raised border-territory-border/60 text-text-primary',
  win:   'bg-green-900/60 border-green-600/60 text-green-300',
  lose:  'bg-territory-red/20 border-territory-red/60 text-territory-red',
  error: 'bg-territory-red/20 border-territory-red/60 text-territory-red',
};

const TYPE_ICONS = { info: 'ℹ️', win: '🏆', lose: '💀', error: '⚠️' };

export default function Notification() {
  const { notification, clearNotification } = useGameStore();

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(clearNotification, 4000);
    return () => clearTimeout(t);
  }, [notification]);

  if (!notification) return null;

  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-5 py-3 rounded border text-sm',
        'shadow-xl backdrop-blur-sm',
        TYPE_STYLES[notification.type] || TYPE_STYLES.info,
        'animate-[fadeInUp_0.2s_ease-out]'
      )}
      style={{ minWidth: '220px', maxWidth: '90vw' }}
    >
      <span>{TYPE_ICONS[notification.type]}</span>
      <span>{notification.message}</span>
      <button
        onClick={clearNotification}
        className="ml-auto text-current opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
