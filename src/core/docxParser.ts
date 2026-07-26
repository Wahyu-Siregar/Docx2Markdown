import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import {
  DocumentAST,
  ASTNode,
  HeadingNode,
  ParagraphNode,
  ListNode,
  ListItemNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ImageNode,
  InlineNode,
  FootnoteNode,
  PageBreakNode,
} from '../types/ast';

interface Relationship {
  id: string;
  type: string;
  target: string;
}

interface StyleMap {
  [styleId: string]: {
    name: string;
    headingLevel?: number;
    isQuote?: boolean;
    isCode?: boolean;
    isCaption?: boolean;
  };
}

export class DocxParser {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: false,
    });
  }

  public async parseDocx(arrayBuffer: ArrayBuffer, filename: string): Promise<DocumentAST> {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Read Relationships
    const relsMap = await this.parseRelationships(zip);

    // 2. Read Styles
    const stylesMap = await this.parseStyles(zip);

    // 3. Read Images / Media
    const imagesMap = await this.parseMedia(zip, relsMap);

    // 4. Read Footnotes
    const footnotesMap = await this.parseFootnotes(zip, stylesMap);

    // 5. Parse Main Document XML
    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('File document.xml tidak ditemukan di dalam paket DOCX.');
    }

    const docXmlText = await docXmlFile.async('string');
    const docParsed = this.xmlParser.parse(docXmlText);

    const body = docParsed?.['w:document']?.['w:body'];
    if (!body) {
      throw new Error('Struktur XML dokumen tidak valid.');
    }

    const nodes: ASTNode[] = [];
    const stats = {
      headings: 0,
      paragraphs: 0,
      lists: 0,
      tables: 0,
      images: imagesMap.size,
      hyperlinks: 0,
    };

    let currentList: ListNode | null = null;

    // Helper to push nodes and handle list grouping
    const pushNode = (node: ASTNode) => {
      if (node.type === 'list') {
        if (!currentList) {
          currentList = node;
          nodes.push(currentList);
          stats.lists++;
        } else if (currentList.ordered === node.ordered) {
          currentList.items.push(...node.items);
        } else {
          currentList = node;
          nodes.push(currentList);
          stats.lists++;
        }
      } else {
        currentList = null;
        nodes.push(node);
      }
    };

    const elements = Array.isArray(body['w:p'] || body['w:tbl'])
      ? this.getOrderedElements(body)
      : this.getOrderedElements(body);

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const tag = el._tag;

      if (tag === 'w:p') {
        const pNode = this.parseParagraph(el, stylesMap, relsMap, imagesMap, footnotesMap, stats);
        if (pNode) {
          if (pNode.type === 'heading') stats.headings++;
          if (pNode.type === 'paragraph') stats.paragraphs++;
          pushNode(pNode);
        }
      } else if (tag === 'w:tbl') {
        const tblNode = this.parseTable(el, stylesMap, relsMap, imagesMap, footnotesMap, stats);
        if (tblNode) {
          stats.tables++;
          pushNode(tblNode);
        }
      }
    }

    // Attempt to associate captions with images
    this.associateCaptions(nodes, imagesMap);

    return {
      nodes,
      footnotes: footnotesMap,
      images: Array.from(imagesMap.values()),
      statistics: stats,
    };
  }

  private getOrderedElements(body: any): any[] {
    const result: any[] = [];
    for (const key of Object.keys(body)) {
      if (key === 'w:p' || key === 'w:tbl') {
        const val = body[key];
        if (Array.isArray(val)) {
          val.forEach((item) => result.push({ ...item, _tag: key }));
        } else if (val) {
          result.push({ ...val, _tag: key });
        }
      }
    }
    return result;
  }

  private async parseRelationships(zip: JSZip): Promise<Map<string, Relationship>> {
    const map = new Map<string, Relationship>();
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (!relsFile) return map;

    const xmlText = await relsFile.async('string');
    const parsed = this.xmlParser.parse(xmlText);
    const rels = parsed?.['Relationships']?.['Relationship'];

    if (rels) {
      const relList = Array.isArray(rels) ? rels : [rels];
      for (const r of relList) {
        map.set(r['@_Id'], {
          id: r['@_Id'],
          type: r['@_Type'],
          target: r['@_Target'],
        });
      }
    }
    return map;
  }

  private async parseStyles(zip: JSZip): Promise<StyleMap> {
    const map: StyleMap = {};
    const stylesFile = zip.file('word/styles.xml');
    if (!stylesFile) return map;

    const xmlText = await stylesFile.async('string');
    const parsed = this.xmlParser.parse(xmlText);
    const styles = parsed?.['w:styles']?.['w:style'];

    if (styles) {
      const styleList = Array.isArray(styles) ? styles : [styles];
      for (const s of styleList) {
        const styleId = s['@_w:styleId'];
        const nameVal = s['w:name']?.['@_w:val'] || styleId;
        const nameLower = String(nameVal).toLowerCase();

        let headingLevel: number | undefined;
        if (nameLower.includes('heading 1') || styleId === 'Heading1') headingLevel = 1;
        else if (nameLower.includes('heading 2') || styleId === 'Heading2') headingLevel = 2;
        else if (nameLower.includes('heading 3') || styleId === 'Heading3') headingLevel = 3;
        else if (nameLower.includes('heading 4') || styleId === 'Heading4') headingLevel = 4;
        else if (nameLower.includes('heading 5') || styleId === 'Heading5') headingLevel = 5;
        else if (nameLower.includes('heading 6') || styleId === 'Heading6') headingLevel = 6;
        else if (nameLower === 'title') headingLevel = 1;

        map[styleId] = {
          name: nameVal,
          headingLevel,
          isQuote: nameLower.includes('quote'),
          isCode: nameLower.includes('code'),
          isCaption: nameLower.includes('caption'),
        };
      }
    }
    return map;
  }

  private async parseMedia(zip: JSZip, relsMap: Map<string, Relationship>): Promise<Map<string, ImageNode>> {
    const map = new Map<string, ImageNode>();

    for (const [rId, rel] of relsMap.entries()) {
      if (rel.type.includes('/image')) {
        const targetPath = rel.target.startsWith('media/')
          ? `word/${rel.target}`
          : rel.target.startsWith('/')
          ? rel.target.substring(1)
          : `word/${rel.target}`;

        const mediaFile = zip.file(targetPath);
        if (mediaFile) {
          const buffer = await mediaFile.async('uint8array');
          const ext = targetPath.split('.').pop()?.toLowerCase() || 'png';
          let mimeType = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'bmp') mimeType = 'image/bmp';

          map.set(rId, {
            type: 'image',
            id: rId,
            rId,
            originalFilename: pathBasename(targetPath),
            mimeType,
            buffer,
          });
        }
      }
    }
    return map;
  }

  private async parseFootnotes(zip: JSZip, stylesMap: StyleMap): Promise<Map<string, FootnoteNode>> {
    const map = new Map<string, FootnoteNode>();
    const file = zip.file('word/footnotes.xml');
    if (!file) return map;

    const xmlText = await file.async('string');
    const parsed = this.xmlParser.parse(xmlText);
    const fnList = parsed?.['w:footnotes']?.['w:footnote'];

    if (fnList) {
      const list = Array.isArray(fnList) ? fnList : [fnList];
      let numCounter = 1;
      for (const fn of list) {
        const id = fn['@_w:id'];
        const fnType = fn['@_w:type'];
        if (fnType === 'separator' || fnType === 'continuationSeparator') continue;

        const children: ASTNode[] = [];
        const pList = fn['w:p'] ? (Array.isArray(fn['w:p']) ? fn['w:p'] : [fn['w:p']]) : [];
        for (const p of pList) {
          const parsedP = this.parseParagraph(p, stylesMap, new Map(), new Map(), new Map(), { hyperlinks: 0 });
          if (parsedP) children.push(parsedP);
        }

        map.set(id, {
          type: 'footnote',
          id,
          number: numCounter++,
          children,
        });
      }
    }
    return map;
  }

  private parseParagraph(
    pEl: any,
    stylesMap: StyleMap,
    relsMap: Map<string, Relationship>,
    imagesMap: Map<string, ImageNode>,
    footnotesMap: Map<string, FootnoteNode>,
    stats: { hyperlinks: number }
  ): ASTNode | null {
    const pPr = pEl['w:pPr'];
    const styleId = pPr?.['w:pStyle']?.['@_w:val'];
    const styleInfo = styleId ? stylesMap[styleId] : undefined;

    // Check Page Break
    if (pPr?.['w:pageBreakBefore']) {
      return { type: 'page_break', breakType: 'page' };
    }

    // Check Numbering (List Item)
    const numPr = pPr?.['w:numPr'];
    const ilvl = numPr?.['w:ilvl']?.['@_w:val'];
    const numId = numPr?.['w:numId']?.['@_w:val'];

    const inlines: InlineNode[] = [];
    let embeddedImageId: string | null = null;
    let drawingAltText: string | undefined;

    // Process runs & drawing elements inside paragraph
    const runs = pEl['w:r'] || pEl['w:hyperlink'] || pEl['w:drawing'] ? this.getParagraphChildren(pEl) : [];
    for (const child of runs) {
      if (child._tag === 'w:r') {
        const res = this.parseRun(child, relsMap, footnotesMap, stats);
        inlines.push(...res.inlines);
        if (res.imageId) embeddedImageId = res.imageId;
      } else if (child._tag === 'w:hyperlink') {
        const rId = child['@_r:id'];
        const rel = rId ? relsMap.get(rId) : undefined;
        const url = rel?.target || '#';
        stats.hyperlinks++;

        const innerRuns = child['w:r'] ? (Array.isArray(child['w:r']) ? child['w:r'] : [child['w:r']]) : [];
        const linkInlines: InlineNode[] = [];
        for (const ir of innerRuns) {
          const res = this.parseRun(ir, relsMap, footnotesMap, stats);
          linkInlines.push(...res.inlines);
        }

        const linkText = linkInlines.map((i) => i.text || '').join('');
        inlines.push({
          type: 'link',
          text: linkText,
          url,
          children: linkInlines,
        });
      } else if (child._tag === 'w:drawing') {
        const imgInfo = this.extractDrawingImage(child);
        if (imgInfo) {
          embeddedImageId = imgInfo.rId;
          drawingAltText = imgInfo.altText;
        }
      }
    }

    // If paragraph contains a drawing/image, return ImageNode
    if (embeddedImageId && imagesMap.has(embeddedImageId)) {
      const imgNode = imagesMap.get(embeddedImageId)!;
      if (drawingAltText && !imgNode.altText) {
        imgNode.altText = drawingAltText;
      }
      return imgNode;
    }

    const rawText = inlines.map((i) => i.text || '').join('').trim();
    if (!rawText && inlines.length === 0) return null;

    // Check list
    if (numId !== undefined) {
      const level = ilvl ? parseInt(ilvl, 10) : 0;
      const isChecklist = rawText.startsWith('[x]') || rawText.startsWith('[ ]');
      let checked: boolean | undefined;
      let cleanInlines = inlines;

      if (isChecklist) {
        checked = rawText.startsWith('[x]');
      }

      return {
        type: 'list',
        ordered: numId === '1' || numId === '2', // Basic heuristic for ordered list
        items: [
          {
            type: 'list_item',
            level,
            checked,
            children: cleanInlines,
          },
        ],
      };
    }

    // Check heading
    if (styleInfo?.headingLevel) {
      return {
        type: 'heading',
        level: styleInfo.headingLevel,
        children: inlines,
      };
    }

    // Check quote
    if (styleInfo?.isQuote) {
      return {
        type: 'quote',
        level: 1,
        children: [
          {
            type: 'paragraph',
            children: inlines,
          },
        ],
      };
    }

    // Check code block
    if (styleInfo?.isCode) {
      return {
        type: 'code_block',
        code: rawText,
      };
    }

    return {
      type: 'paragraph',
      style: styleInfo?.name,
      children: inlines,
    };
  }

  private getParagraphChildren(pEl: any): any[] {
    const res: any[] = [];
    for (const key of Object.keys(pEl)) {
      if (key === 'w:r' || key === 'w:hyperlink' || key === 'w:drawing') {
        const val = pEl[key];
        if (Array.isArray(val)) {
          val.forEach((item) => res.push({ ...item, _tag: key }));
        } else if (val) {
          res.push({ ...val, _tag: key });
        }
      }
    }
    return res;
  }

  private parseRun(
    rEl: any,
    relsMap: Map<string, Relationship>,
    footnotesMap: Map<string, FootnoteNode>,
    stats: { hyperlinks: number }
  ): { inlines: InlineNode[]; imageId?: string } {
    const rPr = rEl['w:rPr'];
    const isBold = !!rPr?.['w:b'];
    const isItalic = !!rPr?.['w:i'];
    const isStrike = !!rPr?.['w:strike'];
    const isCode = rPr?.['w:rStyle']?.['@_w:val']?.toLowerCase().includes('code');
    const vertAlign = rPr?.['w:vertAlign']?.['@_w:val'];

    // Check for drawings in run
    if (rEl['w:drawing']) {
      const imgInfo = this.extractDrawingImage(rEl['w:drawing']);
      if (imgInfo) {
        return { inlines: [], imageId: imgInfo.rId };
      }
    }

    // Check text
    let text = '';
    const tVal = rEl['w:t'];
    if (typeof tVal === 'string') text = tVal;
    else if (tVal?.['#text']) text = tVal['#text'];

    if (!text) return { inlines: [] };

    let node: InlineNode = { type: 'text', text };

    if (isCode) node = { type: 'code', text };
    else if (isBold && isItalic) node = { type: 'bold', children: [{ type: 'italic', text }] };
    else if (isBold) node = { type: 'bold', text };
    else if (isItalic) node = { type: 'italic', text };
    else if (isStrike) node = { type: 'strikethrough', text };
    else if (vertAlign === 'superscript') node = { type: 'superscript', text };
    else if (vertAlign === 'subscript') node = { type: 'subscript', text };

    return { inlines: [node] };
  }

  private extractDrawingImage(drawingEl: any): { rId: string; altText?: string } | null {
    try {
      const inlineOrAnchor = drawingEl['wp:inline'] || drawingEl['wp:anchor'];
      if (!inlineOrAnchor) return null;

      const docPr = inlineOrAnchor['wp:docPr'];
      const altText = docPr?.['@_descr'] || docPr?.['@_title'] || docPr?.['@_name'];

      const graphic = inlineOrAnchor['a:graphic'];
      const graphicData = graphic?.['a:graphicData'];
      const blip = graphicData?.['pic:pic']?.['pic:blipFill']?.['a:blip'];

      const rId = blip?.['@_r:embed'];
      if (rId) {
        return { rId, altText };
      }
    } catch {
      // Ignore drawing parse error fallback
    }
    return null;
  }

  private parseTable(
    tblEl: any,
    stylesMap: StyleMap,
    relsMap: Map<string, Relationship>,
    imagesMap: Map<string, ImageNode>,
    footnotesMap: Map<string, FootnoteNode>,
    stats: { hyperlinks: number }
  ): TableNode | null {
    const trList = tblEl['w:tr'] ? (Array.isArray(tblEl['w:tr']) ? tblEl['w:tr'] : [tblEl['w:tr']]) : [];
    if (trList.length === 0) return null;

    let isComplex = false;
    const rows: TableRowNode[] = [];

    trList.forEach((tr: any, rIdx: number) => {
      const tcList = tr['w:tc'] ? (Array.isArray(tr['w:tc']) ? tr['w:tc'] : [tr['w:tc']]) : [];
      const cells: TableCellNode[] = [];

      tcList.forEach((tc: any) => {
        const tcPr = tc['w:tcPr'];
        const gridSpan = tcPr?.['w:gridSpan']?.['@_w:val'];
        const vMerge = tcPr?.['w:vMerge'];

        const colSpan = gridSpan ? parseInt(gridSpan, 10) : 1;
        if (colSpan > 1 || vMerge) isComplex = true;

        const cellInlines: InlineNode[] = [];
        const pList = tc['w:p'] ? (Array.isArray(tc['w:p']) ? tc['w:p'] : [tc['w:p']]) : [];

        for (const p of pList) {
          const parsedP = this.parseParagraph(p, stylesMap, relsMap, imagesMap, footnotesMap, stats);
          if (parsedP && 'children' in parsedP && Array.isArray(parsedP.children)) {
            cellInlines.push(...(parsedP.children as InlineNode[]));
          }
        }

        cells.push({
          type: 'table_cell',
          children: cellInlines,
          colSpan,
          isHeader: rIdx === 0,
        });
      });

      rows.push({
        type: 'table_row',
        cells,
      });
    });

    const headers = rows.length > 0 ? rows[0] : undefined;
    const bodyRows = rows.length > 1 ? rows.slice(1) : [];

    return {
      type: 'table',
      headers,
      rows: bodyRows,
      isComplex,
    };
  }

  private associateCaptions(nodes: ASTNode[], imagesMap: Map<string, ImageNode>): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'image') {
        // Look ahead for adjacent paragraph with caption
        if (i + 1 < nodes.length) {
          const nextNode = nodes[i + 1];
          if (nextNode.type === 'paragraph') {
            const text = nextNode.children.map((c) => c.text || '').join('');
            if (this.isCaptionText(text, nextNode.style)) {
              node.caption = text;
            }
          }
        }
        // Look behind if ahead was empty
        if (!node.caption && i > 0) {
          const prevNode = nodes[i - 1];
          if (prevNode.type === 'paragraph') {
            const text = prevNode.children.map((c) => c.text || '').join('');
            if (this.isCaptionText(text, prevNode.style)) {
              node.caption = text;
            }
          }
        }
      }
    }
  }

  private isCaptionText(text: string, styleName?: string): boolean {
    if (styleName?.toLowerCase().includes('caption')) return true;
    const captionPattern = /^(gambar|figure|fig\.|image)\s*\d+/i;
    return captionPattern.test(text.trim());
  }
}

function pathBasename(p: string): string {
  return p.split('/').pop()?.split('\\').pop() || 'image.png';
}
