import test from 'node:test';
import assert from 'node:assert/strict';
import { ImageProcessor } from '../../src/core/imageProcessor.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';
import type { ImageNode } from '../../src/types/ast.ts';

test('ImageProcessor - external mode respects imageDirectory', () => {
  const images: ImageNode[] = [
    {
      type: 'image',
      id: 'rId1',
      rId: 'rId1',
      originalFilename: 'test.png',
      mimeType: 'image/png',
      buffer: new Uint8Array([1, 2, 3]),
      caption: 'Gambar Sampel',
    },
  ];

  const config = {
    ...DEFAULT_CONFIG,
    imageMode: 'external' as const,
    imageDirectory: 'attachments',
  };

  const resultMap = ImageProcessor.processImages(images, config);
  const result = resultMap.get('rId1');

  assert.ok(result);
  assert.equal(result.markdownRef, '![Gambar Sampel](./attachments/gambar-sampel.png)');
  assert.equal(result.filename, 'gambar-sampel.png');
});

test('ImageProcessor - base64 mode', () => {
  const images: ImageNode[] = [
    {
      type: 'image',
      id: 'rId1',
      rId: 'rId1',
      originalFilename: 'test.png',
      mimeType: 'image/png',
      buffer: new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
      altText: 'Alt Text',
    },
  ];

  const config = { ...DEFAULT_CONFIG, imageMode: 'base64' as const };
  const resultMap = ImageProcessor.processImages(images, config);
  const result = resultMap.get('rId1');

  assert.ok(result);
  assert.equal(result.markdownRef, '![Alt Text](data:image/png;base64,SGVsbG8=)');
});
