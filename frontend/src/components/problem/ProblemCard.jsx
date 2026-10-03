import { Link } from "react-router-dom";
import DifficultyBadge from "./DifficultyBadge";

export default function ProblemCard({ problem }) {
  const acceptance = problem.acceptanceRate || 0;

  return (
    <Link
      to={`/problems/${problem.slug}`}
      className="card hover:border-primary-500 transition-colors group flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-primary-400 transition-colors line-clamp-2">
          {problem.title}
        </h3>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      {problem.summary && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
          {problem.summary}
        </p>
      )}

      {/* Tags */}
      {problem.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {problem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{problem.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-dark-600">
        <span>{acceptance}% acceptance</span>
        <span className="text-primary-400 group-hover:translate-x-0.5 transition-transform">
          Solve →
        </span>
      </div>
    </Link>
  );
}