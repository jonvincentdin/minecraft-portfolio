import type { PortfolioContent } from '../../types/content';
import { VoxelCanvas } from '../../components/three/VoxelCanvas';
export function BaselinePage({ content, paused }: { content: PortfolioContent; paused: boolean }) {
 return <section><div className="section-head"><div><p className="section-number">WORLD OF BUILDS / BASELINE</p><h1>{content.settings.name}</h1></div><p>React foundation · M00</p></div>
 <div className="baseline-layout"><div><h2>The first blocks.</h2><p className="baseline-copy">The original assets, typography and renderer are ready for the React migration.</p><p className="baseline-copy">This is a scaffold preview. Public pages and the entry sequence are still to be implemented.</p><a className="btn" href="#projects">Explore route placeholders</a></div><VoxelCanvas paused={paused} /></div></section>;
}
