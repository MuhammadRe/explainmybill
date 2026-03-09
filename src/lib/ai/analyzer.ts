// ─────────────────────────────────────────────────────
// AI Document Analyzer — Powered by Claude
// ─────────────────────────────────────────────────────
// This module sends extracted document content to Claude
// and returns a structured analysis with:
//   - Simple explanation
//   - Hidden fees
//   - Risks / contract traps
//   - Important dates
//   - Savings suggestions
//   - Comparison hints
//   - Key financial figures

import Anthropic from '@anthropic-ai/sdk';
import type {
  HiddenFee,
  Risk,
  ImportantDate,
  SavingsSuggestion,
  ComparisonHint,
  KeyFigure,
} from '@/types';
import type { ExtractedContent } from '@/lib/parsers/document';

// ─────────────────────────────────────────────────────
// Anthropic client
// ─────────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─────────────────────────────────────────────────────
// Analysis result shape
// ─────────────────────────────────────────────────────

export interface AnalysisResult {
  simpleExplanation: string;
  documentType: string;
  riskScore: number; // 0–10
  hiddenFees: HiddenFee[];
  risks: Risk[];
  importantDates: ImportantDate[];
  savingsSuggestions: SavingsSuggestion[];
  comparisonHints: ComparisonHint[];
  keyFigures: KeyFigure[];
  rawResponse: string;
}

// ─────────────────────────────────────────────────────
// System prompt — defines Claude's role and output format
// ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are ExplainMyBill, an expert financial document analyst.
Your job is to analyze bills, contracts, and financial documents and explain them clearly to regular people.

ALWAYS respond with a valid JSON object following this exact schema — no additional text before or after:

{
  "simpleExplanation": "A clear, friendly 2-4 sentence summary of what this document is and what the person needs to know. Write as if explaining to someone with no financial background.",
  "documentType": "Specific document category, e.g. 'Energy Bill', 'Mobile Phone Contract', 'Home Insurance Policy', 'Bank Statement', 'Invoice', etc.",
  "riskScore": <integer 0-10, where 0 = no risk, 10 = very high risk>,
  "hiddenFees": [
    {
      "title": "Short name of the fee",
      "description": "Clear explanation of what this fee is and why it might be unexpected",
      "amount": "£X.XX/month or X% (if identifiable from document)",
      "severity": "low" | "medium" | "high"
    }
  ],
  "risks": [
    {
      "title": "Short risk title",
      "description": "Clear explanation of the risk and its potential impact",
      "severity": "low" | "medium" | "high"
    }
  ],
  "importantDates": [
    {
      "label": "Date label, e.g. 'Contract End Date'",
      "date": "The actual date or period from the document",
      "description": "Why this date matters and what happens on/around it"
    }
  ],
  "savingsSuggestions": [
    {
      "title": "Short suggestion title",
      "description": "Specific, actionable advice to save money or reduce costs",
      "potentialSaving": "Estimated saving if quantifiable, e.g. '€7/month'"
    }
  ],
  "comparisonHints": [
    {
      "title": "What is being compared",
      "description": "Explanation of how the user's situation compares to typical/average",
      "benchmark": "Industry average or typical value, e.g. '€0.34/kWh (EU average)'",
      "userValue": "The user's actual value from the document"
    }
  ],
  "keyFigures": [
    {
      "label": "Figure name, e.g. 'Monthly Total'",
      "value": "The actual value",
      "unit": "Unit if applicable, e.g. 'EUR', 'kWh', '%'"
    }
  ]
}

GUIDELINES:
- Be specific — mention actual amounts, dates, and clause numbers when visible
- Use plain language — avoid jargon
- For energy bills: compare kWh prices to local/EU averages
- For phone/internet: check for hidden service fees, data caps, and contract lock-in
- For insurance: flag exclusion clauses, excess amounts, and auto-renewal traps
- For contracts: highlight cancellation fees, penalty clauses, and automatic price increases
- If something cannot be determined from the document, omit that item rather than guessing
- hiddenFees should only include fees that are NOT prominently disclosed
- riskScore reflects overall financial risk to the consumer (0=safe, 10=very risky)`;

// ─────────────────────────────────────────────────────
// Main analysis function
// ─────────────────────────────────────────────────────

export async function analyzeDocument(content: ExtractedContent): Promise<AnalysisResult> {
  let messageContent: Anthropic.MessageParam['content'];

  if (content.type === 'text') {
    // Text document — send as text block
    messageContent = [
      {
        type: 'text',
        text: `Please analyze the following document:\n\n---\n${content.text}\n---`,
      },
    ];
  } else {
    // Image document — use Claude's multimodal vision capability
    // This handles screenshots, scanned bills, and photos of documents
    const mediaType = content.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
    messageContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: content.base64,
        },
      },
      {
        type: 'text',
        text: 'Please analyze this document image and extract all relevant financial information.',
      },
    ];
  }

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: messageContent,
      },
    ],
  });

  const rawResponse = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse the JSON response from Claude
  let parsed: AnalysisResult;
  try {
    // Extract JSON from the response (Claude might wrap it in markdown code blocks)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse Claude response:', rawResponse);
    throw new Error('AI returned an invalid response format. Please try again.');
  }

  // Validate and sanitize the parsed response
  return {
    simpleExplanation: parsed.simpleExplanation || 'Analysis could not be completed.',
    documentType: parsed.documentType || 'Unknown Document',
    riskScore: Math.min(10, Math.max(0, Math.round(parsed.riskScore ?? 0))),
    hiddenFees: Array.isArray(parsed.hiddenFees) ? parsed.hiddenFees : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    importantDates: Array.isArray(parsed.importantDates) ? parsed.importantDates : [],
    savingsSuggestions: Array.isArray(parsed.savingsSuggestions) ? parsed.savingsSuggestions : [],
    comparisonHints: Array.isArray(parsed.comparisonHints) ? parsed.comparisonHints : [],
    keyFigures: Array.isArray(parsed.keyFigures) ? parsed.keyFigures : [],
    rawResponse,
  };
}
