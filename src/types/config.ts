import type { ImageHandlingMode, LineEnding } from './ast.ts';

export type PresetType = 'custom' | 'github' | 'obsidian' | 'single-file' | 'text-only';

export interface ConversionConfig {
  preset: PresetType;
  imageMode: ImageHandlingMode;
  imageDirectory: string; // Default: "images"
  useCaptionAsFilename: boolean;
  preserveCaptionText: boolean;
  removeCaptionNumber: boolean;
  complexTableFallback: 'html' | 'text';
  pageBreakMode: 'horizontal-rule' | 'comment' | 'ignore';
  includeTableOfContents: boolean;
  lineEnding: LineEnding;
  encoding: 'utf-8';
  includeConversionReport: boolean;
}

export const DEFAULT_CONFIG: ConversionConfig = {
  preset: 'github',
  imageMode: 'external',
  imageDirectory: 'images',
  useCaptionAsFilename: true,
  preserveCaptionText: true,
  removeCaptionNumber: true,
  complexTableFallback: 'html',
  pageBreakMode: 'horizontal-rule',
  includeTableOfContents: true,
  lineEnding: 'auto',
  encoding: 'utf-8',
  includeConversionReport: true,
};

export const PRESETS: Record<PresetType, Partial<ConversionConfig>> = {
  custom: {},
  github: {
    preset: 'github',
    imageMode: 'external',
    imageDirectory: 'images',
    complexTableFallback: 'html',
    pageBreakMode: 'horizontal-rule',
  },
  obsidian: {
    preset: 'obsidian',
    imageMode: 'external',
    imageDirectory: 'attachments',
    complexTableFallback: 'html',
    pageBreakMode: 'horizontal-rule',
  },
  'single-file': {
    preset: 'single-file',
    imageMode: 'base64',
    complexTableFallback: 'html',
  },
  'text-only': {
    preset: 'text-only',
    imageMode: 'none',
    preserveCaptionText: true,
  },
};
