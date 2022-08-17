import { DetailLog, Image, Recipe, UserScrapLog } from '@/api/server/generated';

export type RecipeWithImage = Recipe & {
  image: Image;
};

export type DetailLogWithImageRecipes = DetailLog & {
  image: Image;
  recipes: RecipeWithImage[];
  scrapUsers: UserScrapLog[];
};
