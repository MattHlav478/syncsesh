import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const userId = session?.user?.id;
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("id, event_type, responses, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setSchedules(data);
      else toast.error("Failed to load schedules");
    };

    if (userId) fetchSchedules();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {session?.user?.email}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
        >
          Log Out
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Your Schedules</h2>
        <button
          onClick={() => navigate("/plan")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
        >
          + New Plan
        </button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-gray-500">
          No schedules found. Start planning your first event!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((sched) => {
            const { event_type, responses, created_at } = sched;
            const rawDate = responses?.dates_duration;
            const [startDate, endDate] =
              typeof rawDate === "string"
                ? rawDate.split(/[-–]/).map((s) => s.trim())
                : ["–", "–"];

            return (
              <div
                key={sched.id}
                className="bg-white shadow rounded-lg p-6 border hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {event_type || "Untitled Event"}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {startDate} → {endDate || startDate}
                </p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/plan?id=${sched.id}`)}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Open
                  </button>
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("schedules")
                        .delete()
                        .eq("id", sched.id);
                      if (!error) {
                        toast.success("Deleted schedule");
                        setSchedules((prev) =>
                          prev.filter((s) => s.id !== sched.id)
                        );
                      } else toast.error("Failed to delete");
                    }}
                    className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
