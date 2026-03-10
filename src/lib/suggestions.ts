/**
 * Context-aware smart suggestions for the chat input.
 * When user is viewing a stock, suggest stock-specific questions; when small business profile, suggest business questions; else generic literacy prompts.
 */
export function getDynamicSuggestions(context?: FinPilotContextData | null): string[] {
  const name = context?.shortName || context?.name || context?.symbol;
  const userType = context?.userProfile?.type ?? "";

  if (name && !/small business|shop|business owner/i.test(String(userType))) {
    const stockName = (name as string).replace(/\.(NS|BSE)$/i, "").trim();
    return [
      `Is ${stockName} good for long term?`,
      "What are the risks here?",
      `Explain P/E ratio for ${stockName}`,
      "Should I invest in this stock now?",
    ];
  }

  if (userType && /small business|shop|business owner/i.test(String(userType))) {
    return [
      "How can I save tax with GST as a small business?",
      "Best way to park my business surplus safely?",
      "Do I need business insurance? What kind?",
      "Suggest a safe investment for the next 5 years",
    ];
  }

  return [
    "How to start a SIP?",
    "What is Nifty 50?",
    "Tax saving investments in India",
    "Suggest a safe investment for retirement",
  ];
}
