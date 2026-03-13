export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantityRequired: number;
  unit: string;
  costPerUnit: number;
}

export interface Recipe {
  recipeId: string;
  dishId: string;
  yieldPortions: number;
  ingredients: RecipeIngredient[];
}

export interface Ingredient {
  ingredientId: string;
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  supplier: string;
}
