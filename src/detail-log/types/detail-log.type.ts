import { DetailLog, Image, Recipe, UserGoodLog, UserScrapLog } from '@/api/server/generated';

export type RecipeWithImage = Recipe & {
  image: Image;
};

export type DetailLogWithImageRecipes = DetailLog & {
  image: Image;
  recipes: RecipeWithImage[];
  scrapUsers: UserScrapLog[];
  goodUsers: UserGoodLog[];
};
