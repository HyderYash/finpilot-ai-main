/**
 * Parses assistant message content to extract RECOMMENDATION JSON blocks
 * for Generative UI (rendering InvestmentRecommendationCard inline).
 */

export interface ParsedRecommendation {
  assetName: string;
  assetType: "Stock" | "Mutual Fund" | "SIP" | "FD";
  riskLevel: "Low" | "Medium" | "High";
  thesis: string;
}

export type ParsedSegment =
  | { type: "text"; content: string }
  | { type: "recommendation"; recommendation: ParsedRecommendation };

const JSON_BLOCK_REGEX = /```json\s*([\s\S]*?)```/gi;

function parseRecommendationBlock(raw: string): ParsedRecommendation | null {
  try {
    const obj = JSON.parse(raw.trim()) as Record<string, unknown>;
    if (obj?.type !== "RECOMMENDATION") return null;
    const assetName = obj.assetName;
    const assetType = obj.assetType;
    const riskLevel = obj.riskLevel;
    const thesis = obj.thesis;
    if (
      typeof assetName !== "string" ||
      typeof thesis !== "string" ||
      !["Stock", "Mutual Fund", "SIP", "FD"].includes(String(assetType)) ||
      !["Low", "Medium", "High"].includes(String(riskLevel))
    )
      return null;
    return {
      assetName,
      assetType: assetType as ParsedRecommendation["assetType"],
      riskLevel: riskLevel as ParsedRecommendation["riskLevel"],
      thesis,
    };
  } catch {
    return null;
  }
}

/**
 * Splits assistant content into text and recommendation segments.
 * Removes the ```json ... ``` blocks from text and returns them as separate recommendation segments.
 */
export function parseAssistantContent(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  JSON_BLOCK_REGEX.lastIndex = 0;
  while ((match = JSON_BLOCK_REGEX.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim();
    if (before) segments.push({ type: "text", content: before });

    const rec = parseRecommendationBlock(match[1] ?? "");
    if (rec) segments.push({ type: "recommendation", recommendation: rec });

    lastIndex = JSON_BLOCK_REGEX.lastIndex;
  }

  const after = content.slice(lastIndex).trim();
  if (after) segments.push({ type: "text", content: after });

  if (segments.length === 0 && content.trim()) {
    segments.push({ type: "text", content: content.trim() });
  }

  return segments;
}
