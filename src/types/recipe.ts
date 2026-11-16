export interface Ingredient {
  name: string;
  amount: string;
}

export interface CookingStep {
  step: number;
  text: string;
  highlightWords?: string[]; // Words to emphasize (e.g. "중약불", "1분", "노릇노릇")
  timerSeconds?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  durationMinutes: number;
  difficulty: "초보" | "중급" | "고급";
  servings: string;
  calories?: string;
  emoji: string;
  thumbnailUrl?: string;
  badge?: string;
  description: string;
  youtubeMockUrl?: string;
  ingredients: Ingredient[];
  seasonings: Ingredient[];
  steps: CookingStep[];
}
