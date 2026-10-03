import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProblemBySlug, clearCurrent } from "../redux/slices/problemSlice";
import DifficultyBadge from "../components/problem/DifficultyBadge";
import MainLayout from "../layouts/MainLayout";
import toast from "react-hot-toast";

export default function ProblemDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: problem, detailLoading, detailError } = useSelector(
    (s) => s.problems
  );

  useEffect(() => {
    dispatch(clearCurrent());
    dispatch(getProblemBySlug(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (detailError) toast.error(detailError);
  }, [detailError]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (detailLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="card animate-pulse">
            <div className="h-8 bg-dark-600 rounded w-1/2 mb-4" />
            <div className="h-4 bg-dark-600 rounded w-full mb-2" />
            <div className="h-4 bg-dark-600 rounded w-3/4" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (detailError || !problem) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-4 text-red-400">
              Problem not found
            </h2>
            <p className="text-gray-400 mb-6">
              {detailError || "The problem you're looking for doesn't exist."}
            </p>
            <Link to="/problems" className="btn-primary">
              Back to Problems
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          to="/problems"
          className="text-sm text-gray-500 hover:text-primary-400 mb-6 inline-block"
        >
          ← All Problems
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {problem.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-dark-700 text-gray-400 px-2 py-0.5 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            <span className="text-gray-600">|</span>
            <span>Time: {problem.timeLimit}s</span>
            <span>Memory: {Math.round(problem.memoryLimit / 1024)} MB</span>
            <span>Acceptance: {problem.acceptanceRate || 0}%</span>
          </div>
        </div>

        {/* Description */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </div>
        </div>

        {/* Constraints */}
        {problem.constraints && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-3">Constraints</h2>
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {problem.constraints}
            </pre>
          </div>
        )}

        {/* Input / Output Format */}
        {(problem.inputFormat || problem.outputFormat) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {problem.inputFormat && (
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Input Format
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {problem.inputFormat}
                </p>
              </div>
            )}
            {problem.outputFormat && (
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Output Format
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {problem.outputFormat}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sample test cases */}
        {problem.sampleTestCases?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Examples</h2>
            <div className="space-y-4">
              {problem.sampleTestCases.map((tc, i) => (
                <div key={i} className="card">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-400">
                      Example {i + 1}
                    </h3>
                    <button
                      onClick={() =>
                        copyToClipboard(`Input:\n${tc.input}\n\nOutput:\n${tc.output}`)
                      }
                      className="text-xs text-gray-500 hover:text-primary-400"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Input</div>
                      <pre className="bg-dark-900 border border-dark-600 rounded p-3 text-sm font-mono text-gray-300 overflow-x-auto">
                        {tc.input || "(no input)"}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Output</div>
                      <pre className="bg-dark-900 border border-dark-600 rounded p-3 text-sm font-mono text-gray-300 overflow-x-auto">
                        {tc.output}
                      </pre>
                    </div>
                  </div>
                  {tc.explanation && (
                    <p className="text-sm text-gray-400 mt-3">{tc.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="sticky bottom-4 flex gap-3 justify-end">
          <button
            onClick={() => navigate(`/problems/${problem.slug}/solve`)}
            className="btn-primary shadow-lg shadow-primary-600/20 text-lg px-6 py-3"
          >
            🚀 Solve Problem
          </button>
        </div>
      </div>
    </MainLayout>
  );
}