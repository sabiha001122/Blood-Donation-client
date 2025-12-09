// Simple 404 page.
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="h-20 w-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold">
        404
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="text-slate-600 mt-2">
          The page you are looking for does not exist. Please return to the dashboard.
        </p>
      </div>
      <Link
        to="/"
        className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
      >
        Go home
      </Link>
    </div>
  );
}

export default NotFoundPage;
