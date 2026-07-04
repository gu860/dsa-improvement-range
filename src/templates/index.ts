import type { AlgorithmTemplate } from '../core/types';
import { sortingTemplates as jsSorting } from './sorting';
import { pythonSortingTemplates } from './python-sorting';
import { graphTemplates } from './graph';
import { pythonGraphTemplates } from './python-graph';
import { dpTemplates } from './dp';
import { pythonDpTemplates } from './python-dp';
import { treeTemplates } from './tree';
import { pythonTreeTemplates } from './python-tree';
import { pythonMoreTemplates } from './python-more';
import { moreSortingTemplates } from './more-sorting';
import { moreGraphTemplates } from './more-graph';
import { moreDpTemplates } from './more-dp';
import { moreTreeTemplates } from './more-tree';
import { searchTemplates } from './search';
import { stringTemplates } from './string';

export const allTemplates: AlgorithmTemplate[] = [
  ...jsSorting,
  ...pythonSortingTemplates,
  ...graphTemplates,
  ...pythonGraphTemplates,
  ...dpTemplates,
  ...pythonDpTemplates,
  ...treeTemplates,
  ...pythonTreeTemplates,
  ...pythonMoreTemplates,
  ...moreSortingTemplates,
  ...moreGraphTemplates,
  ...moreDpTemplates,
  ...moreTreeTemplates,
  ...searchTemplates,
  ...stringTemplates,
];

export function getTemplatesByLanguage(language: 'js' | 'python' | 'c'): AlgorithmTemplate[] {
  return allTemplates.filter((t) => t.language === language);
}
