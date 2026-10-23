import type {Advancement} from '../types/content';

export type TreeName = 'achievements'|'certifications';

// A tree is drawable when every parent is a node of the same tree and no parent chain loops.
export function treeProblem(nodes:readonly Advancement[]):string {
 const byId=new Map<string,Advancement>();
 for(const node of nodes){
  if(typeof node.id!=='string'||!node.id)return 'A node is missing its id.';
  if(byId.has(node.id))return 'Duplicate node id "'+node.id+'".';
  byId.set(node.id,node);
 }
 for(const node of nodes){
  if(node.parent&&!byId.has(node.parent))return '"'+node.id+'" links to a parent outside this tree.';
  for(const axis of ['x','y'] as const){const value=Number(node[axis]);if(!Number.isFinite(value)||value<0||value>900)return '"'+node.id+'" has a position outside 0–900.';}
  const seen=new Set<string>();
  for(let at:Advancement|undefined=node;at;at=at.parent?byId.get(at.parent):undefined){
   if(seen.has(at.id))return '"'+node.id+'" is part of a parent cycle.';
   seen.add(at.id);
  }
 }
 return '';
}

export function initialSelection(nodes:readonly Advancement[],current?:string):string|undefined {
 return current&&nodes.some(node=>node.id===current)?current:nodes[0]?.id;
}
