/**
 * Simulated user profiles for Innovyuh 2.0 demo.
 * Used by "Demo" flow to show personalised recommendations and impact.
 */

export interface MockUserProfile {
  id: string;
  type: string;
  description: string;
  goal?: string;
  spareMonthly?: number;
  riskTolerance: "Low" | "Medium" | "High";
  /** Pre-fill question for demo button */
  demoQuestion: string;
}

export const MOCK_FIRST_TIME_INVESTOR: MockUserProfile = {
  id: "college-student",
  type: "College student",
  description: "First-time investor with limited surplus",
  goal: "Beat inflation and build a small corpus",
  spareMonthly: 2000,
  riskTolerance: "Low",
  demoQuestion:
    "I have 2000 rupees spare this month. Where should I put it to beat inflation? I'm a beginner and don't want to lose money.",
};

export const MOCK_SMALL_BUSINESS_OWNER: MockUserProfile = {
  id: "small-business",
  type: "Small business owner",
  description: "Looking to park surplus and grow gradually",
  goal: "Stable returns with some growth",
  spareMonthly: 10000,
  riskTolerance: "Medium",
  demoQuestion:
    "I run a small shop and save around 10,000 rupees every month. What's a safe way to invest this for the next 5 years?",
};

/** Default profile used when "Demo" is clicked (first-time investor). */
export const DEFAULT_DEMO_PROFILE = MOCK_FIRST_TIME_INVESTOR;
