// ─────────────────────────────────────────────────────
// POST /api/upload
// Handles file upload + triggers AI analysis
// ─────────────────────────────────────────────────────
// Flow:
//   1. Validate auth + usage limits
//   2. Parse multipart form data
//   3. Save file to disk
//   4. Create Document record (PROCESSING)
//   5. Extract text / prepare image
//   6. Call Claude AI analyzer
//   7. Save Analysis to DB
//   8. Update Document status to COMPLETED
//   9. Increment user's monthly usage

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { saveUploadedFile, extractDocumentContent } from '@/lib/parsers/document';
import { analyzeDocument } from '@/lib/ai/analyzer';
import { isAllowedFileType, FREE_PLAN_LIMIT } from '@/lib/utils';

// Max file size: 10MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10);

export async function POST(req: NextRequest) {
  // ── 1. Auth check ──────────────────────────────────
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const userPlan = (session.user as any).plan as string;

  // ── 2. Usage limit check ──────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      documentsUsedThisMonth: true,
      documentsResetAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if monthly counter needs resetting (new month)
  const now = new Date();
  const resetAt = new Date(user.documentsResetAt);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: userId },
      data: { documentsUsedThisMonth: 0, documentsResetAt: now },
    });
    user.documentsUsedThisMonth = 0;
  }

  // Enforce free plan limit
  if (user.plan === 'FREE' && user.documentsUsedThisMonth >= FREE_PLAN_LIMIT) {
    return NextResponse.json(
      {
        error: `You've used all ${FREE_PLAN_LIMIT} free analyses this month. Upgrade to Pro for unlimited analyses.`,
        code: 'USAGE_LIMIT_EXCEEDED',
      },
      { status: 403 }
    );
  }

  // ── 3. Parse multipart form data ──────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const pastedText = formData.get('text') as string | null;

  // ── 4. Handle pasted text (no file) ──────────────
  if (pastedText && !file) {
    return handleTextUpload(userId, pastedText);
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
      { status: 400 }
    );
  }

  // Validate file type
  if (!isAllowedFileType(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a PDF, image, or text file.' },
      { status: 400 }
    );
  }

  // ── 5. Save file to disk ──────────────────────────
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  let filePath: string;

  try {
    filePath = await saveUploadedFile(fileBuffer, file.name, userId);
  } catch (error) {
    console.error('File save error:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }

  // ── 6. Create Document record ─────────────────────
  const document = await prisma.document.create({
    data: {
      userId,
      name: file.name,
      mimeType: file.type,
      fileSize: file.size,
      filePath,
      status: 'PROCESSING',
    },
  });

  // ── 7. Process & analyze (async in background) ────
  // We return the document ID immediately and process asynchronously
  processDocument(document.id, filePath, file.type, userId).catch(async (error) => {
    console.error(`Processing failed for document ${document.id}:`, error);
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'FAILED', error: error.message },
    });
  });

  return NextResponse.json(
    { success: true, documentId: document.id, status: 'PROCESSING' },
    { status: 202 }
  );
}

// ── Background processing ─────────────────────────────

async function processDocument(
  documentId: string,
  filePath: string,
  mimeType: string,
  userId: string
): Promise<void> {
  // Extract text or image data
  const content = await extractDocumentContent(filePath, mimeType);

  // Store raw text for text-based documents
  if (content.type === 'text') {
    await prisma.document.update({
      where: { id: documentId },
      data: { rawText: content.text },
    });
  }

  // Run AI analysis
  const analysis = await analyzeDocument(content);

  // Save analysis results
  await prisma.analysis.create({
    data: {
      documentId,
      simpleExplanation: analysis.simpleExplanation,
      documentType: analysis.documentType,
      riskScore: analysis.riskScore,
      hiddenFees: analysis.hiddenFees,
      risks: analysis.risks,
      importantDates: analysis.importantDates,
      savingsSuggestions: analysis.savingsSuggestions,
      comparisonHints: analysis.comparisonHints,
      keyFigures: analysis.keyFigures,
      rawResponse: analysis.rawResponse,
    },
  });

  // Update document type and status
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'COMPLETED',
      type: mapDocumentType(analysis.documentType),
    },
  });

  // Increment user usage counter
  await prisma.user.update({
    where: { id: userId },
    data: { documentsUsedThisMonth: { increment: 1 } },
  });
}

// ── Handle pasted text ────────────────────────────────

async function handleTextUpload(userId: string, text: string) {
  if (text.trim().length < 20) {
    return NextResponse.json({ error: 'Text is too short to analyze' }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      userId,
      name: 'Pasted Text',
      mimeType: 'text/plain',
      fileSize: Buffer.byteLength(text, 'utf8'),
      rawText: text,
      status: 'PROCESSING',
    },
  });

  processDocument(document.id, '', 'text/plain', userId)
    .then(async () => {
      // Text content already set above, but we need to handle the case
      // where processDocument tries to read from filePath
      // For pasted text, we'll handle it specially
    })
    .catch(async (error) => {
      await prisma.document.update({
        where: { id: document.id },
        data: { status: 'FAILED', error: error.message },
      });
    });

  // For text documents, process inline since there's no file to read
  const { analyzeDocument } = await import('@/lib/ai/analyzer');
  const analysis = await analyzeDocument({ type: 'text', text });

  await prisma.analysis.create({
    data: {
      documentId: document.id,
      simpleExplanation: analysis.simpleExplanation,
      documentType: analysis.documentType,
      riskScore: analysis.riskScore,
      hiddenFees: analysis.hiddenFees,
      risks: analysis.risks,
      importantDates: analysis.importantDates,
      savingsSuggestions: analysis.savingsSuggestions,
      comparisonHints: analysis.comparisonHints,
      keyFigures: analysis.keyFigures,
      rawResponse: analysis.rawResponse,
    },
  });

  await prisma.document.update({
    where: { id: document.id },
    data: { status: 'COMPLETED', type: mapDocumentType(analysis.documentType) },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { documentsUsedThisMonth: { increment: 1 } },
  });

  return NextResponse.json(
    { success: true, documentId: document.id, status: 'COMPLETED' },
    { status: 201 }
  );
}

// ── Map AI document type string to Prisma enum ────────

function mapDocumentType(typeString: string): string {
  const lower = typeString.toLowerCase();
  if (lower.includes('energy') || lower.includes('electric') || lower.includes('gas')) return 'ENERGY_BILL';
  if (lower.includes('phone') || lower.includes('mobile')) return 'PHONE_BILL';
  if (lower.includes('internet') || lower.includes('broadband')) return 'INTERNET_BILL';
  if (lower.includes('insurance')) return 'INSURANCE';
  if (lower.includes('bank')) return 'BANK_STATEMENT';
  if (lower.includes('invoice')) return 'INVOICE';
  if (lower.includes('rent') || lower.includes('lease')) return 'RENT_AGREEMENT';
  if (lower.includes('subscription')) return 'SUBSCRIPTION';
  if (lower.includes('contract')) return 'CONTRACT';
  return 'OTHER';
}
