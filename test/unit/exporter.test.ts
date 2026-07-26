import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { Exporter } from '../../src/core/exporter.ts';
import type { ProcessedImageResult } from '../../src/core/imageProcessor.ts';

test('Exporter - createZipPackage with custom image directory and report', async () => {
  const images = new Map<string, ProcessedImageResult>();
  images.set('img1', {
    node: {
      type: 'image',
      id: 'img1',
      rId: 'rId1',
      originalFilename: 'a.png',
      mimeType: 'image/png',
      buffer: new Uint8Array([1, 2]),
    },
    markdownRef: '![img](./attachments/a.png)',
    buffer: new Uint8Array([1, 2]),
    filename: 'a.png',
  });

  const zipBytes = await Exporter.createZipPackage(
    'doc.md',
    '# Test Markdown',
    images,
    'attachments',
    { sourceFile: 'doc.docx' }
  );

  const zip = await JSZip.loadAsync(zipBytes);
  const root = zip.folder('doc');

  assert.ok(root);
  assert.ok(root.file('doc.md'));
  assert.ok(root.file('attachments/a.png'));
  assert.ok(root.file('conversion-report.json'));

  const mdText = await root.file('doc.md')!.async('string');
  assert.equal(mdText, '# Test Markdown');
});

test('Exporter - createZipPackage without report', async () => {
  const zipBytes = await Exporter.createZipPackage(
    'doc.md',
    '# Test Markdown',
    new Map(),
    'images',
    undefined
  );

  const zip = await JSZip.loadAsync(zipBytes);
  const root = zip.folder('doc');

  assert.ok(root);
  assert.ok(root.file('doc.md'));
  assert.equal(root.file('conversion-report.json'), null);
});
