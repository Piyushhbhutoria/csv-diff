import { DiffType } from './diffEngine';

export const DIFF_TYPE_ORDER: DiffType[] = ['added', 'removed', 'modified', 'unchanged'];

export const DIFF_TYPE_META: Record<
  DiffType,
  {
    label: string;
    badgeClassName: string;
    rowClassName: string;
    filterSwatchClassName: string;
    summaryTextClassName: string;
    summaryBorderClassName: string;
  }
> = {
  added: {
    label: 'Added',
    badgeClassName: 'bg-added text-added-foreground',
    rowClassName: 'bg-added-light hover:bg-added-light/80',
    filterSwatchClassName: 'bg-added',
    summaryTextClassName: 'text-added',
    summaryBorderClassName: 'border-added/30',
  },
  removed: {
    label: 'Removed',
    badgeClassName: 'bg-removed text-removed-foreground',
    rowClassName: 'bg-removed-light hover:bg-removed-light/80',
    filterSwatchClassName: 'bg-removed',
    summaryTextClassName: 'text-removed',
    summaryBorderClassName: 'border-removed/30',
  },
  modified: {
    label: 'Modified',
    badgeClassName: 'bg-modified text-modified-foreground',
    rowClassName: 'bg-modified-light hover:bg-modified-light/80',
    filterSwatchClassName: 'bg-modified',
    summaryTextClassName: 'text-modified',
    summaryBorderClassName: 'border-modified/30',
  },
  unchanged: {
    label: 'Unchanged',
    badgeClassName: 'bg-muted text-muted-foreground',
    rowClassName: 'bg-unchanged hover:bg-muted/50',
    filterSwatchClassName: 'bg-muted',
    summaryTextClassName: 'text-muted-foreground',
    summaryBorderClassName: '',
  },
};
