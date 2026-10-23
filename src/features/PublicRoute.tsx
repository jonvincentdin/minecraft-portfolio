import {SkillsPage} from './skills/SkillsPage';
import type { PortfolioContent } from '../types/content';
import type { Scene } from '../components/three/renderer.js';
import type { Route } from '../app/routes';
import { AboutPage } from './about/AboutPage';
import { ProjectsPage } from './projects/ProjectsPage';
import { ExperiencePage } from './experience/ExperiencePage';
import { ContactPage } from './contact/ContactPage';
import { Notice } from '../components/ui/Notice';
import { RoutePlaceholder } from './RoutePlaceholder';
export function PublicRoute({route,content,scenes,paused,notify}:{route:Route;content:PortfolioContent;scenes:Record<string,Scene>;paused:boolean;notify:(message:string)=>void}) {
 const props={content,scenes,paused};
 if(route==='skills')return <SkillsPage {...props} notify={notify}/>;
 if(route==='about')return <AboutPage {...props}/>;
 if(route==='projects')return <ProjectsPage {...props} notify={notify}/>;
 if(route==='experience')return <ExperiencePage {...props}/>;
 if(route==='contact')return <ContactPage content={content}/>;
 return <><Notice>Demo mode — this page is a placeholder for a later milestone.</Notice><RoutePlaceholder route={route}/></>;
}
