export const symbols = [
 ['diamond_pickaxe','Diamond pickaxe'],['diamond_sword','Diamond sword'],['bow','Bow'],['compass','Compass'],['clock','Clock'],['potion','Potion'],['enchanted_book','Enchanted book'],['redstone','Redstone'],['furnace','Furnace'],['grass_block','Grass block'],['lantern','Lantern'],['emerald','Emerald'],['shield','Shield'],['ender_pearl','Ender pearl']
] as const;
export function projectSymbol(value: string) { return symbols.find(([id])=>id===value) || symbols[0]; }
