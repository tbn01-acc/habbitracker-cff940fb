interface PageHeaderProps {
  showTitle?: boolean;
  icon?: React.ReactNode;
  iconBgClass?: string;
  title?: string;
  subtitle?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function PageHeader({ showTitle = false, icon, iconBgClass, title, subtitle, rightAction }: PageHeaderProps) {
  // Only show page title section - AppHeader handles avatar, theme, share, language
  if (!showTitle || !icon || !title) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass || ''}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
        </div>
        {rightAction}
      </div>
    </div>
  );
}