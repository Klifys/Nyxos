import { invokeLLM } from "./_core/llm";

export type SlipExtractionResult = {
  amount: string | null;
  date: string | null;
  bankName: string | null;
  senderName: string | null;
  senderAccount: string | null;
  recipientName: string | null;
  recipientAccount: string | null;
  referenceNumber: string | null;
  confidence: "high" | "medium" | "low";
  isValid: boolean;
  errors: string[];
};

/**
 * Automatically verify a payment slip using AI/OCR
 * Extracts transaction details from the slip image
 */
export async function verifyPaymentSlip(imageUrl: string): Promise<SlipExtractionResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an expert at reading Thai bank transfer slips (สลิปโอนเงิน). Extract the following information from the slip image: Amount (จำนวนเงิน), Date (วันที่), Bank name (ชื่อธนาคาร), Sender name (ชื่อผู้โอน), Sender account (เลขบัญชีผู้โอน), Recipient name (ชื่อผู้รับ), Recipient account (เลขบัญชีผู้รับ), Reference number (เลขอ้างอิง). Return a JSON object with these fields. If you cannot read a field clearly, set it to null. Also include a 'confidence' field: 'high' if all fields are clear, 'medium' if some are unclear, 'low' if mostly unclear. Include an 'isValid' boolean: true if this looks like a legitimate bank slip. Include an 'errors' array with any issues found.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "slip_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              amount: { type: ["string", "null"], description: "Transfer amount" },
              date: { type: ["string", "null"], description: "Transfer date" },
              bankName: { type: ["string", "null"], description: "Bank name" },
              senderName: { type: ["string", "null"], description: "Sender name" },
              senderAccount: { type: ["string", "null"], description: "Sender account number" },
              recipientName: { type: ["string", "null"], description: "Recipient name" },
              recipientAccount: { type: ["string", "null"], description: "Recipient account number" },
              referenceNumber: { type: ["string", "null"], description: "Reference number" },
              confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level" },
              isValid: { type: "boolean", description: "Whether this appears to be a valid bank slip" },
              errors: { type: "array", items: { type: "string" }, description: "Any issues found" },
            },
            required: ["amount", "date", "bankName", "senderName", "senderAccount", "recipientName", "recipientAccount", "referenceNumber", "confidence", "isValid", "errors"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Unexpected response format from LLM");
    }

    const parsed = JSON.parse(content) as SlipExtractionResult;
    return parsed;
  } catch (error) {
    console.error("[SlipVerification] Error verifying slip:", error);
    return {
      amount: null,
      date: null,
      bankName: null,
      senderName: null,
      senderAccount: null,
      recipientName: null,
      recipientAccount: null,
      referenceNumber: null,
      confidence: "low",
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown error during verification"],
    };
  }
}

/**
 * Validate extracted slip data against expected transaction
 */
export function validateSlipData(
  extracted: SlipExtractionResult,
  expectedAmount: string,
  expectedRecipientName: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!extracted.isValid) {
    issues.push("Slip does not appear to be a valid bank transfer slip");
  }

  if (extracted.confidence === "low") {
    issues.push("Extraction confidence is low - manual verification recommended");
  }

  if (extracted.amount) {
    const extractedAmount = parseFloat(extracted.amount.replace(/[^\d.]/g, ""));
    const expected = parseFloat(expectedAmount);
    if (Math.abs(extractedAmount - expected) > 0.01) {
      issues.push(`Amount mismatch: extracted ${extracted.amount}, expected ${expectedAmount}`);
    }
  } else {
    issues.push("Could not extract amount from slip");
  }

  if (extracted.recipientName) {
    if (!extracted.recipientName.includes(expectedRecipientName)) {
      issues.push(`Recipient name mismatch: extracted "${extracted.recipientName}", expected "${expectedRecipientName}"`);
    }
  } else {
    issues.push("Could not extract recipient name from slip");
  }

  if (!extracted.date) {
    issues.push("Could not extract date from slip");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
