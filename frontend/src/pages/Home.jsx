import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Home() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100">
      <nav className="border-b border-dark-600 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-400">
            ⚡ CodeArena
          </Link>
          <div className="flex gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Compete. Code. Conquer.
        </h1>
        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          Sharpen your coding skills in live contests. Solve algorithmic problems. Climb the leaderboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/contests" className="btn-primary text-lg px-6 py-3">Browse Contests</Link>
          <Link to="/problems" className="btn-secondary text-lg px-6 py-3">Practice Problems</Link>
        </div>
      </main>

      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Real Contests", desc: "ICPC-style scoring with live leaderboards and penalties.", icon: "🏆" },
          { title: "Fast Judge", desc: "Instant verdicts on 9 languages — Python, C++, Java, Go & more.", icon: "⚡" },
          { title: "Track Progress", desc: "Detailed submission history, stats, and rating over time.", icon: "📊" },
        ].map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-gray-600 text-sm py-10 border-t border-dark-600">
        © 2026 CodeArena — Built with MERN
      </footer>
    </div>
  );
}