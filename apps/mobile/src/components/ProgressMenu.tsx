import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { PROGRESS_MENU_ITEMS, type ProgressMenuItem } from '../lib/progressMenuItems';
import './ProgressMenu.css';

interface ProgressMenuProps {
  /** Dropdown entries. Defaults to PROGRESS_MENU_ITEMS. */
  items?: ProgressMenuItem[];
  /** 'top' = desktop nav (hover dropdown), 'bottom' = mobile bottom nav (tap popup). */
  variant?: 'top' | 'bottom';
  /** Expired subscription: only items with allowWhenLocked stay clickable. */
  locked?: boolean;
  /** Don't show the orange active state (e.g. while the chat panel is open). */
  suppressActive?: boolean;
  /** Called when the menu opens. */
  onOpen?: () => void;
  /** Called when an item is clicked. */
  onNavigate?: () => void;
}

const isPathActive = (current: string, path: string) =>
  current === path || current.startsWith(`${path}/`);

const focusIsVisible = (el: EventTarget): boolean => {
  try {
    return (el as HTMLElement).matches(':focus-visible');
  } catch {
    return true;
  }
};

const ProgressMenu: React.FC<ProgressMenuProps> = ({
  items = PROGRESS_MENU_ITEMS,
  variant = 'top',
  locked = false,
  suppressActive = false,
  onOpen,
  onNavigate,
}) => {
  const location = useLocation();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [bottomPos, setBottomPos] = useState<{ bottom: number; right: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pointerTypeRef = useRef('mouse');
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const isAdmin = getCurrentUser()?.role === 'admin';

  // Close when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (open) onOpenRef.current?.();
  }, [open]);

  // Mobile: place the popup just above the bottom nav.
  useLayoutEffect(() => {
    if (!open || variant !== 'bottom') return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const bar = trigger.closest('nav') ?? trigger;
    const barRect = bar.getBoundingClientRect();
    const rect = trigger.getBoundingClientRect();
    const viewport = document.documentElement;
    setBottomPos({
      bottom: viewport.clientHeight - barRect.top + 8,
      right: Math.max(8, viewport.clientWidth - rect.right),
    });
  }, [open, variant]);

  // Tap/click outside closes. Resize/rotate closes too.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  if (isAdmin) return null;

  const active = !suppressActive && items.some((item) => isPathActive(location.pathname, item.path));

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Desktop mouse: hover already opened it, so a click keeps it open instead of toggling it shut.
    const mouseClick = variant === 'top' && event.detail > 0 && pointerTypeRef.current === 'mouse';
    setOpen((previous) => (mouseClick ? true : !previous));
  };

  const handleItemClick = () => {
    setOpen(false);
    onNavigate?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && !wrapperRef.current?.contains(next) && !panelRef.current?.contains(next)) {
      setOpen(false);
    }
  };

  const triggerProps = {
    ref: triggerRef,
    type: 'button' as const,
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
    onClick: handleTriggerClick,
    onPointerDown: (event: React.PointerEvent) => {
      pointerTypeRef.current = event.pointerType;
    },
  };

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      className={`pm-panel pm-panel-${variant}`}
      style={variant === 'bottom' && bottomPos ? { bottom: bottomPos.bottom, right: bottomPos.right } : undefined}
    >
      <ul className="pm-list" aria-label="Progress">
        {items.map(({ path, label, icon: Icon, allowWhenLocked }) => {
          const disabled = locked && !allowWhenLocked;
          const itemActive = isPathActive(location.pathname, path);
          const content = (
            <>
              {Icon && <Icon size={16} aria-hidden="true" />}
              <span>{label}</span>
            </>
          );
          return (
            <li key={path}>
              {disabled ? (
                <span className="pm-item pm-item-disabled" aria-disabled="true">
                  {content}
                </span>
              ) : (
                <Link
                  to={path}
                  className={`pm-item ${itemActive ? 'active' : ''}`}
                  aria-current={itemActive ? 'page' : undefined}
                  onClick={handleItemClick}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={`pm pm-${variant}`}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPointerEnter={(event) => {
        if (variant === 'top' && event.pointerType === 'mouse') setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (variant === 'top' && event.pointerType === 'mouse') setOpen(false);
      }}
      onFocus={(event) => {
        if (variant === 'top' && focusIsVisible(event.target)) setOpen(true);
      }}
    >
      {variant === 'top' ? (
        <button {...triggerProps} className={`db-top-nav-item pm-trigger ${active ? 'active' : ''}`}>
          Progress
          <ChevronDown size={14} className="pm-chevron" aria-hidden="true" />
        </button>
      ) : (
        <button
          {...triggerProps}
          aria-label="Progress menu"
          className={`db-bottom-nav-item db-bottom-nav-btn ${active ? 'active' : ''}`}
        >
          <TrendingUp size={22} />
        </button>
      )}

      {open && variant === 'top' && panel}
      {open && variant === 'bottom' && bottomPos && createPortal(panel, document.body)}
    </div>
  );
};

export default ProgressMenu;