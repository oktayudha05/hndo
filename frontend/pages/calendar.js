import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  me,
} from "../lib/api";
import { FaChevronLeft, FaChevronRight, FaRegDotCircle } from "react-icons/fa";
import Image from "next/image";

// ambil jumlah hari dalam bulan
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// bikin grid kalender
function generateCalendar(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const grid = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  while (grid.length < 42) grid.push(null);
  return grid;
}

// palet warna untuk user lain
const otherColors = ["#4ade80", "#60a5fa", "#f472b6", "#22d3ee"];

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState(null);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [editId, setEditId] = useState(null);

  // modal state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateCalendar(year, month);

  async function loadUser() {
    try {
      const data = await me();
      if (data && data.id) setMyUserId(data.id);
      else if (data && data.user?.id) setMyUserId(data.user.id);
    } catch (err) {
      console.error("Gagal ambil user:", err);
    }
  }

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  async function handleAddOrUpdate(e) {
    e.preventDefault();
    if (!title || !start) return;

    try {
      if (editId) {
        await updateEvent(editId, {
          title,
          description,
          start_time: new Date(start).toISOString(),
          end_time: end
            ? new Date(end).toISOString()
            : new Date(start).toISOString(),
          color: "#facc15",
          is_all_day: false,
        });
      } else {
        await createEvent({
          title,
          description,
          start_time: new Date(start).toISOString(),
          end_time: end
            ? new Date(end).toISOString()
            : new Date(start).toISOString(),
          color: "#facc15",
          is_all_day: false,
        });
      }

      setTitle("");
      setDescription("");
      setStart("");
      setEnd("");
      setEditId(null);
      setShowFormModal(false);
      await loadEvents();
    } catch (err) {
      console.error("Gagal simpan event:", err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteEvent(id);
      await loadEvents();
      setSelectedEvents((prev) =>
        prev.filter((ev) => ev.id !== id && ev._id !== id)
      );
    } catch (err) {
      console.error("Gagal hapus event:", err.message);
    }
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  return (
    <>
      <Navbar />
      <main className="flex h-[calc(100vh-64px)] bg-gray-900 text-gray-100">
        {/* Kalender */}
        <section className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            {/* Bulan di kiri */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400 flex items-center gap-2">
              📅{" "}
              {currentDate.toLocaleString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            {/* Navigasi di kanan */}
            <div className="flex gap-2 text-sm md:text-base">
              {/* Bulan lalu */}
              <button
                onClick={prevMonth}
                className="px-2 md:px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 transition flex items-center gap-1"
              >
                <FaChevronLeft className="text-white text-sm md:text-base" />
                <span className="hidden md:inline">Bulan Lalu</span>
              </button>

              {/* Hari ini */}
              <button
                onClick={goToday}
                className="px-2 md:px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-gray-900 transition flex items-center gap-1"
              >
               
                <span className="inline">Hari Ini</span>
              </button>

              {/* Bulan depan */}
              <button
                onClick={nextMonth}
                className="px-2 md:px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 transition flex items-center gap-1"
              >
                <span className="hidden md:inline">Bulan Depan</span>
                <FaChevronRight className="text-white text-sm md:text-base" />
              </button>
            </div>
          </div>

          {/* Header hari */}
          <div className="grid grid-cols-7 mb-2 text-center font-medium text-xs md:text-sm">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div key={d} className="text-purple-300">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="text-gray-400">Memuat event...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, i) => {
                if (!date) return <div key={i} className="min-h-[80px]" />;
                const dayEvents = events.filter(
                  (ev) =>
                    new Date(ev.start_time).toDateString() ===
                    date.toDateString()
                );
                const maxVisible = 3;
                const visibleEvents = dayEvents.slice(0, maxVisible);
                const hiddenCount = dayEvents.length - maxVisible;

                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={i}
                    className={`min-h-[80px] border rounded-lg p-1 text-xs relative ${
                      isToday ? "border-2 border-purple-500" : "border-gray-700"
                    }`}
                  >
                    <div
                      className={`font-medium text-right ${
                        isToday ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    <div className="flex flex-col gap-1 mt-1 max-h-[60px] overflow-y-hidden">
                      {visibleEvents.map((ev, idx) => {
                        const isMine = ev.user_id === myUserId;
                        const color = isMine
                          ? "#facc15"
                          : otherColors[
                              ev.user_id.charCodeAt(0) % otherColors.length
                            ];

                        return (
                          <div
                            key={ev.id || ev._id || idx}
                            title={ev.description || ""}
                            className="rounded px-1 py-0.5 text-[10px] truncate text-gray-900 cursor-pointer shadow-sm"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedEvents(dayEvents);
                            }}
                          >
                            {ev.title}
                          </div>
                        );
                      })}

                      {hiddenCount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedEvents(dayEvents);
                          }}
                          className="text-[10px] text-purple-300 italic"
                        >
                          +{hiddenCount} lagi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Sidebar Form (desktop only) */}
        <aside className="hidden md:block w-80 bg-gray-800 border-l border-purple-800 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4">
            {editId ? "✏️ Edit Agenda" : "➕ Tambah Agenda"}
          </h3>
          <form className="space-y-4" onSubmit={handleAddOrUpdate}>
            <div>
              <label className="block text-sm mb-1">Judul</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                placeholder="cth: Meeting Project"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                placeholder="detail agenda..."
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Mulai</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Selesai</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition font-medium text-white"
            >
              {editId ? "Update" : "Simpan"}
            </button>
          </form>
        </aside>
      </main>

      {/* Floating button (mobile) */}
      <button
        onClick={() => setShowFormModal(true)}
        className="md:hidden fixed bottom-6 right-6 bg-yellow-400 text-gray-900 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition"
      >
        ➕
      </button>

      {/* Modal Form (mobile) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:hidden">
          <div className="bg-gray-800 text-gray-100 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
              {editId ? "✏️ Edit Agenda" : "➕ Tambah Agenda"}
            </h3>
            <form className="space-y-4" onSubmit={handleAddOrUpdate}>
              <div>
                <label className="block text-sm mb-1">Judul</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                  placeholder="cth: Meeting Project"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                  placeholder="detail agenda..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mulai</label>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Selesai</label>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition font-medium text-white"
                >
                  {editId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Event */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-gray-100 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-300">
              📅 Event tanggal {selectedDate.toLocaleDateString("id-ID")}
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedEvents.map((ev, idx) => {
                const isMine = ev.user_id === myUserId;
                const color = isMine
                  ? "#facc15"
                  : otherColors[ev.user_id.charCodeAt(0) % otherColors.length];

                return (
                  <div
                    key={ev.id || ev._id || idx}
                    className="p-2 rounded text-gray-900 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <div className="font-medium">{ev.title}</div>
                    {ev.description && (
                      <div className="text-xs">{ev.description}</div>
                    )}
                    <div className="text-xs mt-1">
                      {new Date(ev.start_time).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(ev.end_time).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {isMine && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditId(ev.id || ev._id);
                            setTitle(ev.title);
                            setDescription(ev.description || "");
                            setStart(ev.start_time.slice(0, 16));
                            setEnd(ev.end_time.slice(0, 16));
                            setSelectedDate(null);
                            setShowFormModal(true);
                          }}
                          className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id || ev._id)}
                          className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedEvents([]);
              }}
              className="mt-4 w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
