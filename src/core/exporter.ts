import JSZip from 'jszip';
import { ProcessedImageResult } from './imageProcessor';

export class Exporter {
  public static async createZipPackage(
    markdownName: string,
    markdownContent: string,
    images: Map<string, ProcessedImageResult>,
    report?: any
  ): Promise<Uint8Array> {
    const zip = new JSZip();
    const folderName = markdownName.replace(/\.md$/i, '');
    const rootFolder = zip.folder(folderName) || zip;

    // 1. Add Markdown file
    rootFolder.file(markdownName, markdownContent);

    // 2. Add Images if present
    const imgFolder = rootFolder.folder('images');
    for (const [_, res] of images.entries()) {
      if (res.buffer && res.filename && imgFolder) {
        imgFolder.file(res.filename, res.buffer);
      }
    }

    // 3. Add optional report JSON
    if (report && rootFolder) {
      rootFolder.file('conversion-report.json', JSON.stringify(report, null, 2));
    }

    return await zip.generateAsync({ type: 'uint8array' });
  }
}
