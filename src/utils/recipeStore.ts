import defaultRecipes from "@/data/recipes.json";
import { Recipe } from "@/types/recipe";

const STORAGE_KEY = "cookvoice_custom_recipes";

export function getCustomRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Recipe[];
  } catch (e) {
    console.error("Failed to read custom recipes from localStorage:", e);
    return [];
  }
}

export function saveCustomRecipe(recipe: Recipe): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomRecipes();
    const filtered = existing.filter((r) => r.id !== recipe.id);
    const updated = [recipe, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save custom recipe:", e);
  }
}

export function getAllRecipes(): Recipe[] {
  const base = defaultRecipes as Recipe[];
  if (typeof window === "undefined") return base;

  const custom = getCustomRecipes();
  // Filter out any duplicates
  const customIds = new Set(custom.map((r) => r.id));
  const remainingBase = base.filter((r) => !customIds.has(r.id));
  return [...custom, ...remainingBase];
}

export function getRecipeById(id: string): Recipe | undefined {
  const all = getAllRecipes();
  return all.find((r) => r.id === id);
}
