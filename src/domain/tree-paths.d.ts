export interface TreeLink { id:string; parent:string }
export interface TreePoint { x:number|string; y:number|string }
export interface TreeRoute { oldPath:string[]; newPath:string[]; shared:string[]; retract:string[]; extend:string[]; disconnected:boolean }
export interface PathAnimator { select(id:string):Promise<void>; destroy():void }
export function rootPath(nodes:readonly TreeLink[],id:string|null|undefined):string[];
export function routeBetween(nodes:readonly TreeLink[],from:string|null|undefined,to:string|null|undefined):TreeRoute;
export function canConnect(nodes:readonly TreeLink[],parent:string,child:string):boolean;
export function treeLine(parent:TreePoint,child:TreePoint):string;
export function createPathAnimator(world:ParentNode,nodes:readonly TreeLink[],paused:()=>boolean):PathAnimator;
