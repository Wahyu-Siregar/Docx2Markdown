import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { DocxParser } from '../../src/core/docxParser.ts';

test('DocxParser - maintains strict node order: paragraph -> table -> paragraph', async () => {
  const zip = new JSZip();

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Paragraf Pertama</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc>
          <w:p><w:r><w:t>Sel Tabel</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p>
      <w:r><w:t>Paragraf Kedua</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  const parser = new DocxParser();
  const ast = await parser.parseDocx(buffer, 'test.docx');

  assert.equal(ast.nodes.length, 3);
  assert.equal(ast.nodes[0].type, 'paragraph');
  assert.equal(ast.nodes[1].type, 'table');
  assert.equal(ast.nodes[2].type, 'paragraph');

  const p1 = ast.nodes[0] as any;
  const p2 = ast.nodes[2] as any;
  assert.equal(p1.children[0].text, 'Paragraf Pertama');
  assert.equal(p2.children[0].text, 'Paragraf Kedua');
});

test('DocxParser - parses w:br, w:tab, and multiple w:t elements in run', async () => {
  const zip = new JSZip();

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Baris 1</w:t>
        <w:br/>
        <w:t>Baris 2</w:t>
        <w:tab/>
        <w:t>Tabbed</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  const parser = new DocxParser();
  const ast = await parser.parseDocx(buffer, 'test.docx');

  assert.equal(ast.nodes.length, 1);
  const p = ast.nodes[0] as any;
  assert.equal(p.children[0].text, 'Baris 1\nBaris 2\tTabbed');
});

test('DocxParser - ignores formatting attributes with w:val="0"', async () => {
  const zip = new JSZip();

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b w:val="0"/>
          <w:i w:val="false"/>
        </w:rPr>
        <w:t>Normal Text</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  const parser = new DocxParser();
  const ast = await parser.parseDocx(buffer, 'test.docx');

  const p = ast.nodes[0] as any;
  assert.equal(p.children[0].type, 'text');
  assert.equal(p.children[0].text, 'Normal Text');
});

test('DocxParser - parses w:u as underline', async () => {
  const zip = new JSZip();

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:u w:val="single"/></w:rPr>
        <w:t>Underlined Text</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  const parser = new DocxParser();
  const ast = await parser.parseDocx(buffer, 'test.docx');

  const p = ast.nodes[0] as any;
  assert.equal(p.children[0].type, 'underline');
  assert.equal(p.children[0].text, 'Underlined Text');
});

test('DocxParser - preserves text before and after drawing in single paragraph', async () => {
  const zip = new JSZip();

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:t xml:space="preserve">Sebelum </w:t></w:r>
      <w:drawing>
        <wp:inline>
          <a:graphic>
            <a:graphicData>
              <pic:pic>
                <pic:blipFill>
                  <a:blip r:embed="rId1"/>
                </pic:blipFill>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
      <w:r><w:t xml:space="preserve"> Sesudah</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  zip.file('word/_rels/document.xml.rels', relsXml);
  zip.file('word/media/image1.png', new Uint8Array([1, 2, 3]));
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  const parser = new DocxParser();
  const ast = await parser.parseDocx(buffer, 'test.docx');

  assert.equal(ast.nodes.length, 3);
  assert.equal(ast.nodes[0].type, 'paragraph');
  assert.equal(ast.nodes[1].type, 'image');
  assert.equal(ast.nodes[2].type, 'paragraph');

  const p1 = ast.nodes[0] as any;
  const p2 = ast.nodes[2] as any;
  assert.equal(p1.children[0].text, 'Sebelum ');
  assert.equal(p2.children[0].text, ' Sesudah');
});
