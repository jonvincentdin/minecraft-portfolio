import type {CraftRecipe} from './crafting-data';
export interface WorkshopState { version:1; bag:Record<string,number>; grid:(string|null)[]; learned:string[]; crafted:number }
export function freshWorkshop():WorkshopState;
export function validWorkshop(value:unknown):value is WorkshopState;
export function inventoryStacks(state:WorkshopState):{id:string;count:number;key:string}[];
export function quantities(pattern:(string|null)[][]):Record<string,number>;
export function totalAvailable(state:WorkshopState,id:string):number;
export function recipeStatus(state:WorkshopState,recipe:CraftRecipe):{ready:boolean;missingSkills:string[];missing:{id:string;count:number}[];ingredients:Record<string,number>};
export function matchRecipe(grid:(string|null)[]):CraftRecipe|null;
export function clearGrid(state:WorkshopState):WorkshopState;
export function placeItem(state:WorkshopState,id:string,index:number):WorkshopState;
export function returnItem(state:WorkshopState,index:number):WorkshopState;
export function moveGrid(state:WorkshopState,from:number,to:number):WorkshopState;
export function loadRecipe(state:WorkshopState,id:string):WorkshopState;
export function takeOutput(state:WorkshopState):{state:WorkshopState;recipe:CraftRecipe|null};
export function craftRecipe(state:WorkshopState,id:string):{state:WorkshopState;recipe:CraftRecipe|null};
