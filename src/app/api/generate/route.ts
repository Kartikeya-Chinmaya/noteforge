import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Allow up to 60s for Vercel serverless function
export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

type OutputStyle = 'short' | 'standard' | 'detailed' | 'learn';

const stylePrompts: Record<OutputStyle, string> = {
  short: `Create very concise notes with only the key points. Use 5-10 bullet points maximum.
Focus on the most important concepts only. Be brief and direct.`,

  standard: `Create well-structured notes with clear headings and subpoints.
Include main concepts, key details, and important relationships.
Use bullet points and organize by topic. Aim for a balanced level of detail.`,

  detailed: `Create comprehensive, in-depth notes covering all aspects of the content.
Include:
- Main concepts with thorough explanations
- Supporting details and examples
- Definitions of key terms
- Relationships between concepts
- Important nuances and context
Organize with clear headings and subheadings.`,

  learn: `Create study-focused notes that help with learning and retention.
Include:
1. SUMMARY: A brief overview of the main topic
2. KEY CONCEPTS: Main ideas explained clearly
3. IMPORTANT DETAILS: Supporting information
4. QUESTIONS & ANSWERS: 5-10 Q&A pairs to test understanding
5. QUICK REVIEW: 3-5 key takeaways to remember

Format the Q&A section clearly with Q: and A: prefixes.`
};

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse tries to load a test PDF on require(), which fails on Vercel.
    // Import the core module directly to avoid that.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

async function extractTextFromOffice(buffer: Buffer): Promise<string> {
  try {
    const officeParser = await import('officeparser');
    const result = await officeParser.parseOffice(buffer);
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result);
  } catch (error) {
    console.error('Office file parsing error:', error);
    throw new Error('Failed to parse Office file');
  }
}

async function processImageWithGroq(buffer: Buffer, mimeType: string): Promise<string> {
  const base64Image = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.2-90b-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all text and describe the content from this image. If it contains handwritten notes, transcribe them. If it contains diagrams or charts, describe them in detail.',
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
}

async function generateNotes(content: string, style: OutputStyle): Promise<string> {
  const prompt = `${stylePrompts[style]}

Here is the content to create notes from:

---
${content}
---

Create the notes now. Use plain text formatting (no markdown symbols like ** or ##). Use CAPS for headings and - for bullet points.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    const fileType = formData.get('fileType') as string;
    const outputStyle = formData.get('outputStyle') as OutputStyle;

    if (!outputStyle) {
      return NextResponse.json({ error: 'Output style is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Please add GROQ_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    let content = '';

    if (text) {
      content = text;
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name.toLowerCase();

      if (fileType === 'pdf' || filename.endsWith('.pdf')) {
        content = await extractTextFromPDF(buffer);
      } else if (fileType === 'ppt' || filename.endsWith('.pptx') || filename.endsWith('.ppt')) {
        content = await extractTextFromOffice(buffer);
      } else if (fileType === 'image' || /\.(png|jpg|jpeg|gif|webp)$/.test(filename)) {
        content = await processImageWithGroq(buffer, file.type);
      } else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
        content = await extractTextFromOffice(buffer);
      } else if (filename.endsWith('.txt') || filename.endsWith('.md')) {
        content = buffer.toString('utf-8');
      } else {
        try {
          content = buffer.toString('utf-8');
        } catch {
          return NextResponse.json(
            { error: 'Unsupported file type' },
            { status: 400 }
          );
        }
      }
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any content from the file' },
        { status: 400 }
      );
    }

    const notes = await generateNotes(content, outputStyle);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
