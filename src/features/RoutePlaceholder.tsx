import { routes, type Route } from '../app/routes';
export function RoutePlaceholder({ route }: { route: Route }) {
 const title = route === 'editor' ? 'Editor' : route === 'not-found' ? 'Page not found' : routes[route];
 return <section><div className="section-head"><h1>{title}</h1></div><p>{route === 'not-found' ? 'This route does not exist.' : title + ' is a route placeholder. This feature is not implemented in M00.'}</p><p className="baseline-copy">{route === 'editor' ? 'Owner authentication, drafts and publication will require the authorized backend. Editing is unavailable.' : 'The supplied reference remains the visual and behavioral target.'}</p><a className="btn secondary" href="#home">Back to spawn</a></section>;
}
