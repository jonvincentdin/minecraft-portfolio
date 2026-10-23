export function SectionHeading({ label, title, description }: { label:string; title:string; description:string }) {
 return <div className="section-head"><div><span className="eyebrow">{label}</span><h1>{title}</h1></div><p>{description}</p></div>;
}
export function EmptyState({ title }: { title:string }) {
 return <div className="empty-state"><h3>{title}</h3><p>Add content in the editor to complete this chapter.</p><a href="#editor" className="btn secondary">Open editor</a></div>;
}
