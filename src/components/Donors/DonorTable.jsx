// DonorTable renders a responsive table of donors.
import { Link } from "react-router-dom";

function DonorTable({ donors }) {
  if (!donors || donors.length === 0) {
    return <p className="text-sm text-slate-600">No donors found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Blood Group</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Visibility</th>
            <th className="px-4 py-3">Willing</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {donors.map((donor) => (
            <tr key={donor._id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{donor.fullName}</td>
              <td className="px-4 py-3">{donor.bloodGroup}</td>
              <td className="px-4 py-3">{donor.address?.city || "-"}</td>
              <td className="px-4 py-3">{donor.phone || "Hidden"}</td>
              <td className="px-4 py-3 capitalize">{donor.visibility || "public"}</td>
              <td className="px-4 py-3">
                {donor.willingToDonate ? (
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    Yes
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                    No
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/donors/${donor._id}`}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonorTable;
