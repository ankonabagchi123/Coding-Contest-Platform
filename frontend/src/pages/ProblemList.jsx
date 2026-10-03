import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProblems, setFilter, resetFilters } from "../redux/slices/problemSlice";
import ProblemCard from "../components/problem/ProblemCard";
import MainLayout from "../layouts/MainLayout";

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function ProblemList() {
  const dispatch = useDispatch();
  const { list, pagination, listLoading, listError, filters } = useSelector(
    (s) => s.problems
  );

  const [searchInput, setSearchInput] = useState(filters.search);

  // Fetch on filter change
  useEffect(() => {
    dispatch(getProblems(filters));
  }, [dispatch, filters]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilter({ search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, dispatch, filters.search]);

  const handleDifficulty = (d) => {
    dispatch(setFilter({ difficulty: filters.difficulty === d ? "" : d }));
  };

  const handleReset = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const changePage = (p) => {
    dispatch(setFilter({ page: p }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    filters.search || filters.difficulty || filters.tags;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Problems</h1>
          <p className="text-gray-400">
            Sharpen your skills with {pagination.total} challenges
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search problems..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Difficulty pills */}
            <div className="flex items-center gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficulty(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors border ${
                    filters.difficulty === d
                      ? "bg-primary-600 border-primary-500 text-white"
                      : "bg-dark-700 border-dark-600 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <button onClick={handleReset} className="btn-secondary text-sm">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-dark-600 rounded w-3/4 mb-3" />
                <div className="h-3 bg-dark-600 rounded w-full mb-2" />
                <div className="h-3 bg-dark-600 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listError ? (
          <div className="card text-center py-12">
            <p className="text-red-400 mb-4">{listError}</p>
            <button onClick={() => dispatch(getProblems(filters))} className="btn-primary">
              Retry
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No problems found</h3>
            <p className="text-gray-400 mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Problems will appear here once added"}
            </p>
            {hasActiveFilters && (
              <button onClick={handleReset} className="btn-primary">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((p) => (
                <ProblemCard key={p.id || p._id} problem={p} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>

                <div className="flex gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const p = i + 1;
                    if (
                      p === 1 ||
                      p === pagination.pages ||
                      Math.abs(p - pagination.page) <= 1
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => changePage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            p === pagination.page
                              ? "bg-primary-600 text-white"
                              : "bg-dark-700 text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === 2 && pagination.page > 3) {
                      return <span key={p} className="text-gray-600 px-1 self-end">…</span>;
                    }
                    if (
                      p === pagination.pages - 1 &&
                      pagination.page < pagination.pages - 2
                    ) {
                      return <span key={p} className="text-gray-600 px-1 self-end">…</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}