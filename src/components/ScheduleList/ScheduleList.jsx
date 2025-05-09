import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function ScheduleList({ userId, onLoadSchedule }) {
  const [schedules, setSchedules] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editData, setEditData] = useState({
    event_type: "",
    dates_duration: "",
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("id, event_type, responses, schedule, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setSchedules(data);
      else console.error("Failed to fetch schedules", error);
    };

    if (userId) fetchSchedules();
  }, [userId]);

  const getDateRange = (responses) => {
    if (!responses?.dates_duration) return ["-", "-"];
    const [start, end] = responses.dates_duration
      .split(/[-–]/)
      .map((s) => s.trim());
    return [start, end || start];
  };

  const openEditModal = (schedule) => {
    setEditData({
      event_type: schedule.event_type || "",
      dates_duration: schedule.responses?.dates_duration || "",
    });
    setEditingSchedule(schedule);
  };

  const handleEditSave = async () => {
    const updatedResponses = {
      ...editingSchedule.responses,
      dates_duration: editData.dates_duration,
    };

    const { error } = await supabase
      .from("schedules")
      .update({
        event_type: editData.event_type,
        responses: updatedResponses,
      })
      .eq("id", editingSchedule.id);

    if (error) {
      toast.error("Failed to update schedule metadata.");
    } else {
      toast.success("Schedule updated!");
      setSchedules((prev) =>
        prev.map((sched) =>
          sched.id === editingSchedule.id
            ? {
                ...sched,
                event_type: editData.event_type,
                responses: updatedResponses,
              }
            : sched
        )
      );
      setEditingSchedule(null);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this schedule?"
    );
    if (!confirm) return;

    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete schedule.");
    } else {
      toast.success("Schedule deleted.");
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Your Saved Schedules</h2>
      <div className="bg-white shadow rounded divide-y">
        {schedules.map((sched) => {
          const [startDate, endDate] = getDateRange(sched.responses);
          const isExpanded = expandedId === sched.id;

          return (
            <div key={sched.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : sched.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {sched.event_type || "Untitled Event"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {startDate} → {endDate}
                  </div>
                </div>
                <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out px-4 bg-gray-50 ${
                  isExpanded ? "max-h-96 py-4" : "max-h-0"
                }`}
              >
                {isExpanded && (
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(sched.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Team Size:</strong> {sched.responses.attendees}
                    </p>
                    <p>
                      <strong>Tone:</strong> {sched.responses.tone}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <button
                        onClick={() => onLoadSchedule(sched.schedule)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Load This Schedule
                      </button>
                      <button
                        onClick={() => openEditModal(sched)}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        ✏️ Edit Metadata
                      </button>
                      <button
                        onClick={() => handleDelete(sched.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Schedule Metadata</h3>
            <label className="block mb-2 text-sm">Event Type</label>
            <input
              type="text"
              value={editData.event_type}
              onChange={(e) =>
                setEditData({ ...editData, event_type: e.target.value })
              }
              className="w-full p-2 border rounded mb-4"
            />
            <label className="block mb-2 text-sm">Date Range</label>
            <input
              type="text"
              value={editData.dates_duration}
              onChange={(e) =>
                setEditData({ ...editData, dates_duration: e.target.value })
              }
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setEditingSchedule(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleEditSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
