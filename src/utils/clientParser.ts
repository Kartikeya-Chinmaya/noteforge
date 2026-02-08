import JSZip from 'jszip';

/**
 * Extract text from PPTX/DOCX files on the client side using JSZip.
 * These formats are ZIP archives containing XML with the actual text.
 */

export async function extractTextFromPPTX(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const texts: string[] = [];

  // PPTX stores slides in ppt/slides/slide1.xml, slide2.xml, etc.
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort();

  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('text');
    // Extract text between <a:t> tags
    const matches = content.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (matches) {
      const slideTexts = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      if (slideTexts.length > 0) {
        texts.push(slideTexts.join(' '));
      }
    }
  }

  return texts.join('\n\n');
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const docFile = zip.files['word/document.xml'];
  if (!docFile) {
    throw new Error('Invalid DOCX file');
  }

  const content = await docFile.async('text');

  // Extract text from <w:t> tags
  const matches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (!matches) return '';

  const texts = matches.map(m => m.replace(/<[^>]+>/g, ''));

  // Group by paragraphs (rough — join with spaces, split on implied paragraph boundaries)
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Try to extract text client-side for supported file types.
 * Returns the extracted text, or null if the file type needs server-side processing.
 */
export async function extractTextClientSide(file: File, fileType: string): Promise<string | null> {
  const name = file.name.toLowerCase();

  try {
    if (fileType === 'ppt' || name.endsWith('.pptx')) {
      return await extractTextFromPPTX(file);
    }

    if (name.endsWith('.docx')) {
      return await extractTextFromDOCX(file);
    }

    // Plain text files — read directly
    if (name.endsWith('.txt') || name.endsWith('.md')) {
      return await file.text();
    }

    // For .ppt (old format), PDF, images, and others — return null to use server
    return null;
  } catch (error) {
    console.error('Client-side parsing failed:', error);
    return null;
  }
}
