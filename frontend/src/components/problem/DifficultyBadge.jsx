const CONFIG = {
  easy: {
    label: "Easy",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  hard: {
    label: "Hard",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export default function DifficultyBadge({ difficulty }) {
  const cfg = CONFIG[difficulty] || CONFIG.easy;
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}