import type { ImageNode } from '../types/ast.ts';
import type { ConversionConfig } from '../types/config.ts';

export interface ProcessedImageResult {
  node: ImageNode;
  markdownRef: string;
  buffer?: Uint8Array;
  filename?: string;
  warning?: string;
}

export class ImageProcessor {
  public static processImages(
    images: ImageNode[],
    config: ConversionConfig
  ): Map<string, ProcessedImageResult> {
    const resultMap = new Map<string, ProcessedImageResult>();
    const usedFilenames = new Map<string, number>();

    let totalSize = 0;

    images.forEach((img, idx) => {
      totalSize += img.buffer.length;
      let filename = ImageProcessor.generateFilename(img, idx, config, usedFilenames);
      img.processedFilename = filename;

      if (config.imageMode === 'none') {
        let md = '';
        if (config.preserveCaptionText && (img.caption || img.altText)) {
          md = `\n*${img.caption || img.altText}*\n`;
        }
        resultMap.set(img.id, {
          node: img,
          markdownRef: md,
        });
      } else if (config.imageMode === 'base64') {
        const b64 = ImageProcessor.bufferToBase64(img.buffer);
        const dataUri = `data:${img.mimeType};base64,${b64}`;
        const alt = img.caption || img.altText || img.title || `Gambar ${idx + 1}`;
        let warning: string | undefined;

        if (img.buffer.length > 5 * 1024 * 1024) {
          warning = `Gambar "${filename}" berukuran > 5 MB. Mode Base64 dapat menyebabkan file Markdown lambat dimuat.`;
        }

        resultMap.set(img.id, {
          node: img,
          markdownRef: `![${alt}](${dataUri})`,
          warning,
        });
      } else {
        // Mode external folder
        const folder = config.imageDirectory.trim() || 'images';
        const relPath = `./${folder}/${filename}`;
        const alt = img.caption || img.altText || img.title || `Gambar ${idx + 1}`;

        resultMap.set(img.id, {
          node: img,
          markdownRef: `![${alt}](${relPath})`,
          buffer: img.buffer,
          filename,
        });
      }
    });

    if (config.imageMode === 'base64' && totalSize > 10 * 1024 * 1024) {
      // Add global total size warning if needed
    }

    return resultMap;
  }

  private static generateFilename(
    img: ImageNode,
    index: number,
    config: ConversionConfig,
    usedNames: Map<string, number>
  ): string {
    const ext = ImageProcessor.getFileExtension(img.originalFilename, img.mimeType);
    let rawName = '';

    if (config.useCaptionAsFilename && img.caption) {
      rawName = img.caption;
      if (config.removeCaptionNumber) {
        rawName = rawName.replace(/^(gambar|figure|fig\.|image)\s*\d+[:.]?\s*/i, '');
      }
    } else if (img.altText) {
      rawName = img.altText;
    } else if (img.title) {
      rawName = img.title;
    } else {
      rawName = `image-${String(index + 1).padStart(3, '0')}`;
    }

    let slug = ImageProcessor.slugify(rawName);
    if (!slug) {
      slug = `image-${String(index + 1).padStart(3, '0')}`;
    }

    // Truncate slug to max 80 chars
    if (slug.length > 80) {
      slug = slug.substring(0, 80);
    }

    // Windows reserved filenames protection
    const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'lpt1', 'lpt2'];
    if (reservedNames.includes(slug.toLowerCase())) {
      slug = `img-${slug}`;
    }

    let count = usedNames.get(slug) || 0;
    count++;
    usedNames.set(slug, count);

    let finalName = slug;
    if (count > 1) {
      finalName = `${slug}-${count}`;
    }

    return `${finalName}.${ext}`;
  }

  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Trim hyphens
  }

  private static getFileExtension(filename: string, mimeType: string): string {
    const parts = filename.split('.');
    if (parts.length > 1) return parts.pop()!.toLowerCase();

    if (mimeType.includes('jpeg')) return 'jpg';
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('gif')) return 'gif';
    if (mimeType.includes('svg')) return 'svg';
    if (mimeType.includes('webp')) return 'webp';
    if (mimeType.includes('bmp')) return 'bmp';
    return 'png';
  }

  private static bufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }
}
