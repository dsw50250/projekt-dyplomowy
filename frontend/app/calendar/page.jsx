"use client";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Navigate as RbcNavigate } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import api from "../../services/api";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [allTasks, setAllTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false); 
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadTasks();
  }, [token]);

  async function loadTasks() {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      const tasks = res.data || [];

      setAllTasks(tasks);

      updateEvents(tasks, showOnlyMyTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  function updateEvents(tasks, onlyMy) {
    const calendarEvents = tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        allDay: true,
        resource: task,
        isMyTask: task.assignedtoid === user?.id, 
      }));

    setEvents(calendarEvents);
  }

  const toggleMyTasks = () => {
    const newValue = !showOnlyMyTasks;
    setShowOnlyMyTasks(newValue);
    updateEvents(allTasks, newValue);
  };

  const handleNavigate = (action) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      switch (action) {
        case RbcNavigate.PREV:
          newDate.setMonth(prevDate.getMonth() - 1);
          break;
        case RbcNavigate.NEXT:
          newDate.setMonth(prevDate.getMonth() + 1);
          break;
        case RbcNavigate.TODAY:
          return new Date();
        default:
          return prevDate;
      }
      return newDate;
    });
  };

  const Event = ({ event }) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{event.title}</span>
        {event.resource.User?.name && (
          <span className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Assigned to: {event.resource.User.name}
          </span>
        )}
      </div>
    );
  };

  const CustomToolbar = ({ label }) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigate(RbcNavigate.PREV)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            ←
          </button>
          <span className="font-semibold text-lg">{label}</span>
          <button
            onClick={() => handleNavigate(RbcNavigate.NEXT)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            →
          </button>
        </div>

        {}
        <button
          onClick={toggleMyTasks}
          className={`px-5 py-2 rounded-xl font-medium transition text-sm ${
            showOnlyMyTasks
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-white"
          }`}
        >
          {showOnlyMyTasks ? "Showing all (my tasks highlighted)" : "Highlight only my tasks"}
        </button>
      </div>
    );
  };

  const calendarStyle = theme === "dark" ? {
    backgroundColor: "#1a1a2e",
    color: "white",
    borderRadius: "0.75rem",
    padding: "1rem",
  } : {};

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      <button
        onClick={() => router.back()}
        className={`mb-8 inline-flex items-center px-6 py-3 rounded-xl font-medium transition shadow-md ${
          theme === "dark" ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
        }`}
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-8">Task Calendar</h1>

      {loading ? (
        <p className="text-xl">Loading calendar...</p>
      ) : (
        <>
          {events.length === 0 && (
            <p className={`text-xl mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {showOnlyMyTasks
                ? "No due dates found in your assigned tasks (showing all anyway)"
                : "No tasks with due dates found"}
            </p>
          )}
          <div className="rounded-xl shadow-lg" style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={setCurrentDate}
              views={["month", "week", "day"]}
              components={{ event: Event, toolbar: CustomToolbar }}
              style={calendarStyle}
              popup
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: theme === "dark" ? "#6b21a8" : "#a78bfa",
                  color: "white",
                  borderRadius: "0.5rem",
                  padding: "2px 4px",
                  border: "none",
                  opacity: showOnlyMyTasks && !event.isMyTask ? 0.3 : 1, 
                },
              })}
              dayPropGetter={(date) => {
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                return {
                  style: {
                    backgroundColor: isToday
                      ? theme === "dark" ? "#4c0070" : "#c4b5fd"
                      : undefined,
                  },
                };
              }}
              onSelectEvent={(event) =>
                alert(
                  `Task: ${event.title}\nDue: ${event.start.toLocaleDateString()}` +
                    (event.resource.User?.name
                      ? `\nAssigned to: ${event.resource.User.name}`
                      : "")
                )
              }
            />
          </div>
        </>
      )}
    </div>
  );
}