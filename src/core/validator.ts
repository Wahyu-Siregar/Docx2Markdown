import { ProcessedImageResult } from './imageProcessor';
import { ConversionConfig } from '../types/config';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
}

export class OutputValidator {
  public static validate(
    markdown: string,
    images: Map<string, ProcessedImageResult>,
    config: ConversionConfig
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!markdown || markdown.trim().length === 0) {
      issues.push({
        severity: 'error',
        message: 'Hasil Markdown kosong.',
      });
    }

    // Check null bytes
    if (markdown.includes('\0')) {
      issues.push({
        severity: 'error',
        message: 'Hasil Markdown mengandung null byte yang tidak valid.',
      });
    }

    // Check external image links in Mode C
    if (config.imageMode === 'external') {
      const folder = config.imageDirectory || 'images';
      const imgRefRegex = new RegExp(`!\\[.*?\\]\\(\\.\\/${folder}\\/([^\\s)]+)\\)`, 'g');
      let match;
      while ((match = imgRefRegex.exec(markdown)) !== null) {
        const refFilename = match[1];
        const exists = Array.from(images.values()).some((i) => i.filename === refFilename);
        if (!exists) {
          issues.push({
            severity: 'error',
            message: `Gambar direferensikan pada Markdown tetapi file tidak ditemukan: ${refFilename}`,
          });
        }
      }
    }

    // Check Base64 links in Mode B
    if (config.imageMode === 'base64') {
      const b64Regex = /!\[.*?\]\(data:image\/[a-zA-Z+]+;base64,([A-Za-z0-9+/=]+)\)/g;
      let match;
      while ((match = b64Regex.exec(markdown)) !== null) {
        const b64Data = match[1];
        if (!b64Data || b64Data.length === 0) {
          issues.push({
            severity: 'error',
            message: 'Terdapat link Base64 yang tidak dapat didekode.',
          });
        }
      }
    }

    return issues;
  }
}
