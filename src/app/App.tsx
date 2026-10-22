import { useEffect, useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Notice } from '../components/ui/Notice';
import { BaselinePage } from '../features/home/BaselinePage';
import { RoutePlaceholder } from '../features/RoutePlaceholder';
import { createContentRepository } from '../data/repository';
import type { ContentSnapshot } from '../types/content';
import { readRoute } from './routes';
export function App() {
 const [route, setRoute] = useState(() => readRoute(location.hash));
 const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [snapshot, setSnapshot] = useState<ContentSnapshot>();
 const [error, setError] = useState('');
 useEffect(() => { const change = () => { setRoute(readRoute(location.hash)); document.getElementById('main')?.focus(); }; addEventListener('hashchange', change); return () => removeEventListener('hashchange', change); }, []);
 useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setPaused(media.matches); media.addEventListener('change', change); return () => media.removeEventListener('change', change); }, []);
 useEffect(() => { let alive = true; Promise.resolve().then(() => createContentRepository(import.meta.env).getPublishedContent('jvd-world')).then(value => { if (alive) setSnapshot(value); }).catch(reason => { if (alive) setError(String(reason.message)); }); return () => { alive = false; }; }, []);
 return <Shell route={route} paused={paused} togglePause={() => setPaused(value => !value)}>
 {error ? <Notice error>{error}</Notice> : !snapshot ? <Notice>Loading content…</Notice> : <><Notice>Demo mode — supplied example content. Editing and remote saves are unavailable.</Notice>{route === 'home' ? <BaselinePage content={snapshot.content} paused={paused} /> : <RoutePlaceholder route={route} />}</>}
 </Shell>;
}
