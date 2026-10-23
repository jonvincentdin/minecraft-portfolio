import type {Recipe, StartingItem} from '../types/content';
export interface CraftItem { id:string; name:string; model:string; kind:string; note:string }
export interface CraftRecipe extends Recipe { category:string; pattern:(string|null)[][]; mirror?:boolean }
export const craftItems:CraftItem[];
export const itemById:Record<string,CraftItem>;
export const resultModels:string[][];
export const STACK_LIMIT:number;
export let recipes:CraftRecipe[];
export let recipeById:Record<string,CraftRecipe>;
export let startingBag:Record<string,number>;
export function defaultRecipes():Recipe[];
export function defaultStartingInventory():StartingItem[];
export function recipePattern(recipe:Recipe):(string|null)[][];
export function validateWorkshopConfig(records:Recipe[],inventory:StartingItem[]):true;
export function configureWorkshop(records?:Recipe[],inventory?:StartingItem[]):void;
