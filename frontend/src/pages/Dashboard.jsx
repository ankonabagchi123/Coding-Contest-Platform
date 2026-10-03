import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);

  const stats = [
    { label: "Rating", value: user?.rating || 1200, color: "text-primary-400" },
    { label: "Max Rating", value: user?.maxRating || 1200, color: "text-blue-400" },
    { label: "Problems Solved", value: user?.solvedProblems?.length || 0, color: "text-green-400" },
    { label: "Submissions", value: user?.stats?.totalSubmissions || 0, color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-primary-400">{user?.name}</span>
          </h1>
          <p className="text-gray-400">
            Ready to solve some problems?
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="card">
              <div className="text-sm text-gray-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link to="/problems" className="card hover:border-primary-500 transition-colors group">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-400 transition-colors">
              Practice Problems
            </h3>
            <p className="text-gray-400 text-sm">Sharpen your skills with algorithm challenges</p>
          </Link>

          <Link to="/contests" className="card hover:border-primary-500 transition-colors group">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-400 transition-colors">
              Join a Contest
            </h3>
            <p className="text-gray-400 text-sm">Compete live with other programmers</p>
          </Link>
        </div>

        {/* Profile info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="text-gray-200">{user?.name}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="text-gray-200">{user?.email}</div>
            </div>
            <div>
              <div className="text-gray-500">Role</div>
              <div className="text-gray-200 capitalize">{user?.role}</div>
            </div>
            <div>
              <div className="text-gray-500">Member since</div>
              <div className="text-gray-200">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}