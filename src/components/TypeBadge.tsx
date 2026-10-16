import { getTypeStyle, capitalize } from '../utils/formatters';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TypeBadge({
  type,
  size = 'md',
  interactive = false,
  active = false,
  onClick,
  className = '',
}: TypeBadgeProps) {
  const style = getTypeStyle(type);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wide',
    md: 'text-xs px-2.5 py-1 tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-medium tracking-wide',
  };

  const Component = interactive ? 'button' : 'span';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-semibold uppercase rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${sizeClasses[size]} ${style.badge} ${
        interactive
          ? `cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-500 ${
              active ? 'ring-2 ring-white shadow-md' : 'opacity-85 hover:opacity-100'
            }`
          : ''
      } ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-xs"
        aria-hidden="true"
      />
      <span>{capitalize(type)}</span>
    </Component>
  );
}
