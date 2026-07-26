import { ImageHandlingMode, LineEnding, Dialect } from './ast';

export type PresetType = 'custom' | 'github' | 'obsidian' | 'single-file' | 'text-only';

export interface ConversionConfig {
  preset: PresetType;
  dialect: Dialect;
  imageMode: ImageHandlingMode;
  imageDirectory: string; // Default: "images"
  useCaptionAsFilename: boolean;
  preserveCaptionText: boolean;
  removeCaptionNumber: boolean;
  allowHtml: boolean;
  complexTableFallback: 'html' | 'text';
  pageBreakMode: 'horizontal-rule' | 'comment' | 'ignore';
  includeTableOfContents: boolean;
  lineEnding: LineEnding;
  encoding: 'utf-8';
  includeConversionReport: boolean;
  zipPackage: boolean;
}

export const DEFAULT_CONFIG: ConversionConfig = {
  preset: 'github',
  dialect: 'gfm',
  imageMode: 'external',
  imageDirectory: 'images',
  useCaptionAsFilename: true,
  preserveCaptionText: true,
  removeCaptionNumber: true,
  allowHtml: true,
  complexTableFallback: 'html',
  pageBreakMode: 'horizontal-rule',
  includeTableOfContents: true,
  lineEnding: 'auto',
  encoding: 'utf-8',
  includeConversionReport: true,
  zipPackage: true,
};

export const PRESETS: Record<PresetType, Partial<ConversionConfig>> = {
  custom: {},
  github: {
    preset: 'github',
    dialect: 'gfm',
    imageMode: 'external',
    imageDirectory: 'images',
    allowHtml: true,
    complexTableFallback: 'html',
    pageBreakMode: 'horizontal-rule',
  },
  obsidian: {
    preset: 'obsidian',
    dialect: 'commonmark',
    imageMode: 'external',
    imageDirectory: 'attachments',
    allowHtml: true,
    complexTableFallback: 'html',
    pageBreakMode: 'horizontal-rule',
  },
  'single-file': {
    preset: 'single-file',
    dialect: 'gfm',
    imageMode: 'base64',
    allowHtml: true,
    complexTableFallback: 'html',
  },
  'text-only': {
    preset: 'text-only',
    dialect: 'gfm',
    imageMode: 'none',
    preserveCaptionText: true,
  },
};
