import type { ReactNode } from 'react';
import { routes, type Route } from '../../app/routes';
export function Shell({ route, paused, togglePause, children }: { route: Route; paused: boolean; togglePause: () => void; children: ReactNode }) {
 return <><a className="skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
 <header id="site-header"><a href="#home" className="brand" aria-label="Portfolio home"><b>JVD<span className="brand-dot">▪</span></b><span>JON VINCENT DIN</span></a>
 <nav aria-label="Main navigation">{Object.entries(routes).map(([id, title]) => <a key={id} href={'#' + id} aria-current={route === id ? 'page' : undefined}>{title}</a>)}</nav>
 <button className="motion" aria-pressed={paused} onClick={togglePause}>{paused ? 'Resume motion' : 'Pause motion'}</button></header>
 <main id="main" tabIndex={-1}>{children}</main>
 <footer id="site-footer"><span>JON VINCENT DIN / M00 DEMO FOUNDATION</span><a href="#home">Back to spawn ↑</a></footer></>;
}
