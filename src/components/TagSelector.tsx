import { useState, useMemo } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { useUserTags, UserTag } from '@/hooks/useUserTags';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  className?: string;
}

export function TagSelector({ selectedTagIds, onChange, className }: TagSelectorProps) {
  const { tags, loading } = useUserTags();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTags = useMemo(() => {
    if (!search.trim()) return tags;
    const searchLower = search.toLowerCase();
    return tags.filter(tag => tag.name.toLowerCase().includes(searchLower));
  }, [tags, search]);

  const selectedTags = useMemo(() => {
    return tags.filter(tag => selectedTagIds.includes(tag.id));
  }, [tags, selectedTagIds]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  if (loading) {
    return (
      <div className="h-10 bg-muted animate-pulse rounded-lg" />
    );
  }

  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {t('noTagsCreated')}
      </p>
    );
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full min-h-[40px] px-3 py-2 border border-border rounded-lg bg-background text-left flex flex-wrap gap-1.5 items-center"
          >
            {selectedTags.length > 0 ? (
              <>
                {selectedTags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={(e) => removeTag(tag.id, e)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </>
            ) : (
              <span className="text-muted-foreground">{t('selectTags')}</span>
            )}
            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchTags')}
            className="h-8 mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                {t('noTagsFound')}
              </p>
            ) : (
              filteredTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                    selectedTagIds.includes(tag.id)
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-left truncate">{tag.name}</span>
                  {selectedTagIds.includes(tag.id) && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
