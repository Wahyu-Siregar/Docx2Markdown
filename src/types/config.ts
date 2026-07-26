import { ImageHandlingMode, LineEnding, Dialect } from './ast';

export interface ConversionConfig {
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
