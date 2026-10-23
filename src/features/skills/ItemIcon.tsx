import {itemById,recipes} from '../../domain/crafting-data.js';
export function outputModel(id:string){return recipes.find(r=>r.output===id)?.resultModel||itemById[id].model;}
export function ItemIcon({id,model,className=''}:{id:string;model?:string;className?:string}) {
 return <img className={className} src={'/assets/thumbs/'+(model||outputModel(id))+'.png'} alt="" draggable={false}/>;
}
