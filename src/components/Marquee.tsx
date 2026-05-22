export default function Marquee({ items, speed = 28 }) {
  const content = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {content.map((t, i) => (
          <span key={i} className={i % 3 === 0 ? 'hot' : ''}>
            {t} <span className="text-white/30 mx-2">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
