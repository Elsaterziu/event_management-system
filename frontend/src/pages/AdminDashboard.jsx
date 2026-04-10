import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("overview");

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [eventSearch, setEventSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [eventFilter, setEventFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationEventFilter, setRegistrationEventFilter] = useState("all");
  
  const filteredRegistrations = useMemo(() => {
  return registrations.filter((registration) => {
    const userName = registration.user?.name || "";
    const userEmail = registration.user?.email || "";
    const eventTitle = registration.event?.title || "";

    const text = `${userName} ${userEmail} ${eventTitle}`.toLowerCase();
    const matchesSearch = text.includes(registrationSearch.toLowerCase());

    let matchesEvent = true;
    if (registrationEventFilter !== "all") {
      matchesEvent = String(registration.event?.id) === String(registrationEventFilter);
    }
    return matchesSearch && matchesEvent;
  }); }, [registrations, registrationSearch, registrationEventFilter]);
  
  const emptyForm = {
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: "",
    image: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [editingEventId, setEditingEventId] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-page">
        <div className="admin-denied">
          <h1>Access Denied</h1>
          <p>Only admins can access this page.</p>
        </div>
      </div>
    );
  }

  const normalizeListResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.events)) return data.events;
    if (Array.isArray(data?.users)) return data.users;
    return [];
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await api.get("/events");
      setEvents(normalizeListResponse(response.data));
    } catch (err) {
      console.error("EVENTS ERROR:", err.response?.data || err.message);
      setError("Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/users");
      setUsers(normalizeListResponse(response.data));
    } catch (err) {
      console.error("USERS ERROR:", err.response?.data || err.message);
      setError("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoadingRegistrations(true);
      const response = await api.get("/registrations");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setRegistrations(data);
    } catch (err) {
      console.error("REGISTRATIONS ERROR:", err.response?.data || err.message);
      setError("Failed to load registrations.");
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchRegistrations();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingEventId(null);
  };

  const openConfirmModal = ({ title, message, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        max_participants: Number(formData.max_participants),
        image: formData.image,
      };

      if (editingEventId) {
        const response = await api.put(`/events/${editingEventId}`, payload);
        setMessage(response.data?.message || "Event updated successfully.");
      } else {
        const response = await api.post("/events", payload);
        setMessage(response.data?.message || "Event created successfully.");
      }

      resetForm();
      fetchEvents();
    } catch (err) {
      console.error("SAVE EVENT ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save event.");
    }
  };

  const handleEditEvent = (event) => {
    setActiveTab("events");
    setEditingEventId(event.id);

    setFormData({
      title: event.title || "",
      description: event.description || "",
      event_date: formatForDateTimeLocal(event.event_date),
      location: event.location || "",
      max_participants: event.max_participants || "",
      image: event.image || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDeleteEvent = (eventId) => {
    openConfirmModal({
      title: "Delete Event",
      message: "Are you sure you want to delete this event?",
      onConfirm: async () => {
        try {
          setMessage("");
          setError("");
          const response = await api.delete(`/events/${eventId}`);
          setMessage(response.data?.message || "Event deleted successfully.");

          if (editingEventId === eventId) {
            resetForm();
          }

          fetchEvents();
          closeConfirmModal();
        } catch (err) {
          console.error("DELETE EVENT ERROR:", err.response?.data || err.message);
          setError(err.response?.data?.message || "Failed to delete event.");
          closeConfirmModal();
        }
      },
    });
  };

  const handleAddUserToEvent = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedUserId || !selectedEventId) {
      setError("Please select both a user and an event.");
      return;
    }

    try {
      const response = await api.post(`/events/${selectedEventId}/add-user`, {
        user_id: Number(selectedUserId),
      });

      setMessage(response.data?.message || "User added to event successfully.");
      setSelectedUserId("");
      setSelectedEventId("");
      fetchEvents();
      fetchRegistrations();
    } catch (err) {
      console.error("ADD USER ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to add user to event.");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    openConfirmModal({
      title: "Change Role",
      message: `Are you sure you want to make this user ${newRole}?`,
      onConfirm: async () => {
        setMessage("");
        setError("");

        try {
          const response = await api.put(`/users/${userId}/role`, {
            role: newRole,
          });

          setMessage(response.data?.message || "User role updated successfully.");
          fetchUsers();
          closeConfirmModal();
        } catch (err) {
          console.error("CHANGE ROLE ERROR:", err.response?.data || err.message);
          setError(err.response?.data?.message || "Failed to update user role.");
          closeConfirmModal();
        }
      },
    });
  };

  const handleDeleteUser = (userId) => {
  openConfirmModal({
    title: "Delete User",
    message: "Are you sure you want to delete this user?",
    onConfirm: async () => {
      setMessage("");
      setError("");

      try {
        const response = await api.delete(`/users/${userId}`);
        setMessage(response.data?.message || "User deleted successfully.");
        fetchUsers();
        fetchRegistrations();
        closeConfirmModal();
      } catch (err) {
        console.error("DELETE USER ERROR:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to delete user.");
        closeConfirmModal();
      }
    },
  });
};

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const text =
        `${event.title || ""} ${event.location || ""} ${event.description || ""}`.toLowerCase();

      const matchesSearch = text.includes(eventSearch.toLowerCase());

      const eventDate = event.event_date ? new Date(event.event_date) : null;
      const isUpcoming = eventDate && eventDate > now;
      const isPast = eventDate && eventDate < now;
      const isMine = Number(event.created_by) === Number(user.id);

      let matchesFilter = true;

      if (eventFilter === "my") matchesFilter = isMine;
      if (eventFilter === "upcoming") matchesFilter = isUpcoming;
      if (eventFilter === "past") matchesFilter = isPast;

      return matchesSearch && matchesFilter;
    });
  }, [events, eventSearch, eventFilter, user.id]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const text = `${item.name || ""} ${item.email || ""} ${item.role || ""}`.toLowerCase();
      const matchesSearch = text.includes(userSearch.toLowerCase());

      let matchesFilter = true;
      if (userFilter === "admins") matchesFilter = item.role === "admin";
      if (userFilter === "users") matchesFilter = item.role === "user";

      return matchesSearch && matchesFilter;
    });
  }, [users, userSearch, userFilter]);

  const myEvents = useMemo(() => {
    return events.filter((event) => Number(event.created_by) === Number(user.id));
  }, [events, user.id]);

  const totalAdmins = useMemo(() => {
    return users.filter((item) => item.role === "admin").length;
  }, [users]);

  const totalNormalUsers = useMemo(() => {
    return users.filter((item) => item.role !== "admin").length;
  }, [users]);

  const totalParticipants = useMemo(() => {
    return events.reduce((sum, event) => sum + Number(event.users_count || 0), 0);
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => event.event_date && new Date(event.event_date) > now).length;
  }, [events]);

  const fullEvents = useMemo(() => {
    return events.filter((event) => {
      const maxParticipants = Number(event.max_participants || 0);
      const usersCount = Number(event.users_count || 0);
      return maxParticipants > 0 && usersCount >= maxParticipants;
    }).length;
  }, [events]);

  const recentEvents = [...events].slice(0, 5);
  const recentUsers = [...users].slice(0, 5);

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = event.event_date ? new Date(event.event_date) : null;
    const participantsCount = Number(event.users_count || 0);
    const maxParticipants = Number(event.max_participants || 0);

    if (maxParticipants > 0 && participantsCount >= maxParticipants) {
      return { label: "Full", className: "status-badge full" };
    }

    if (eventDate) {
      const today = new Date();
      const isToday =
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate();

      if (isToday) return { label: "Today", className: "status-badge today" };
      if (eventDate > now) return { label: "Upcoming", className: "status-badge upcoming" };
      if (eventDate < now) return { label: "Past", className: "status-badge past" };
    }

    return { label: "Unknown", className: "status-badge" };
  };

  return (
    <div className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <h2>Admin Panel</h2>
            <p>Event management system</p>
          </div>

          <div className="admin-nav">
            <button
              type="button"
              className={`sidebar-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>

            <button
              type="button"
              className={`sidebar-btn ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              Events
            </button>

            <button
              type="button"
              className={`sidebar-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Users
            </button>

            <button
              type="button"
              className={`sidebar-btn ${activeTab === "registrations" ? "active" : ""}`}
              onClick={() => setActiveTab("registrations")}
            >
              Registrations
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          {activeTab === "overview" && (
            <>
              <section className="stats-grid">
                <div className="stat-card">
                  <span>Total Events</span>
                  <h3>{events.length}</h3>
                </div>

                <div className="stat-card">
                  <span>My Events</span>
                  <h3>{myEvents.length}</h3>
                </div>

                <div className="stat-card">
                  <span>Total Users</span>
                  <h3>{users.length}</h3>
                </div>

                <div className="stat-card">
                  <span>Upcoming Events</span>
                  <h3>{upcomingEvents}</h3>
                </div>

                <div className="stat-card">
                  <span>Total Participants</span>
                  <h3>{totalParticipants}</h3>
                </div>

                <div className="stat-card">
                  <span>Full Events</span>
                  <h3>{fullEvents}</h3>
                </div>
              </section>

              <section className="admin-two-columns">
                <div className="panel-card">
                  <div className="panel-header">
                    <h2>Recent Events</h2>
                  </div>

                  {loadingEvents ? (
                    <p className="muted-text">Loading events...</p>
                  ) : recentEvents.length === 0 ? (
                    <p className="muted-text">No events found.</p>
                  ) : (
                    <div className="simple-list">
                      {recentEvents.map((event) => (
                        <div key={event.id} className="simple-list-item">
                          <div>
                            <h4>{event.title}</h4>
                            <p>{event.location}</p>
                          </div>
                          <span>{event.event_date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="panel-card">
                  <div className="panel-header">
                    <h2>Users Summary</h2>
                  </div>

                  <div className="summary-boxes">
                    <div className="summary-box">
                      <span>Admins</span>
                      <strong>{totalAdmins}</strong>
                    </div>

                    <div className="summary-box">
                      <span>Users</span>
                      <strong>{totalNormalUsers}</strong>
                    </div>
                  </div>

                  <h3 className="subheading">Latest Users</h3>

                  {loadingUsers ? (
                    <p className="muted-text">Loading users...</p>
                  ) : recentUsers.length === 0 ? (
                    <p className="muted-text">No users found.</p>
                  ) : (
                    <div className="simple-list">
                      {recentUsers.map((item) => (
                        <div key={item.id} className="simple-list-item">
                          <div>
                            <h4>{item.name}</h4>
                            <p>{item.email}</p>
                          </div>
                          <span
                            className={`role-badge ${
                              item.role === "admin" ? "admin" : "user"
                            }`}
                          >
                            {item.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === "events" && (
            <section className="admin-two-columns">
              <div className="panel-card">
                <div className="panel-header">
                  <h2>{editingEventId ? "Edit Event" : "Create Event"}</h2>
                </div>

                <form className="admin-form" onSubmit={handleCreateOrUpdateEvent}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date and Time</label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      name="max_participants"
                      value={formData.max_participants}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Event Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary-btn">
                      {editingEventId ? "Update Event" : "Create Event"}
                    </button>

                    {editingEventId && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="panel-card">
                <div className="panel-header panel-header-events">

                  <div className="events-toolbar">
                    <div className="event-filters">
                      <button
                        type="button"
                        className={`filter-btn ${eventFilter === "all" ? "active" : ""}`}
                        onClick={() => setEventFilter("all")}
                      >
                        All
                      </button>

                      <button
                        type="button"
                        className={`filter-btn ${eventFilter === "my" ? "active" : ""}`}
                        onClick={() => setEventFilter("my")}
                      >
                        My
                      </button>

                      <button
                        type="button"
                        className={`filter-btn ${eventFilter === "upcoming" ? "active" : ""}`}
                        onClick={() => setEventFilter("upcoming")}
                      >
                        Upcoming
                      </button>

                      <button
                        type="button"
                        className={`filter-btn ${eventFilter === "past" ? "active" : ""}`}
                        onClick={() => setEventFilter("past")}
                      >
                        Past
                      </button>
                    </div>

                    <input
                      className="search-input events-search"
                      type="text"
                      placeholder="Search events..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                    />
                  </div>
                </div>

                {loadingEvents ? (
                  <p className="muted-text">Loading events...</p>
                ) : filteredEvents.length === 0 ? (
                  <p className="muted-text">No events found.</p>
                ) : (
                  <div className="card-list">
                    {filteredEvents.map((event) => {
                      const status = getEventStatus(event);

                      return (
                        <div key={event.id} className="data-card">
                          <div className="data-card-content">
                            <div className="data-card-top">
                              <div>
                                <h3>{event.title}</h3>
                                {/*<p>{event.description}</p>*/}
                              </div>

                              <span className={status.className}>{status.label}</span>
                            </div>

                            <div className="data-grid">
                              <div>
                                <span>Location</span>
                                <strong>{event.location}</strong>
                              </div>

                              <div>
                                <span>Date</span>
                                <strong>{event.event_date}</strong>
                              </div>

                              <div>
                                <span>Participants</span>
                                <strong>
                                  {event.users_count || 0} / {event.max_participants}
                                </strong>
                              </div>

                              <div>
                                <span>Created By</span>
                                <strong>{event.created_by || "-"}</strong>
                              </div>
                            </div>

                            <div className="event-card-actions">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => handleEditEvent(event)}
                              >
                                Edit
                              </button>

                              <Link
                                to={`/events/${event.id}/participants`}
                                className="action-btn participants-btn"
                              >
                                Participants
                              </Link>

                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() => confirmDeleteEvent(event.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section className="admin-two-columns">
              <div className="panel-card">
                <div className="panel-header">
                  <h2>Add User to Event</h2>
                </div>

                <form className="admin-form" onSubmit={handleAddUserToEvent}>
                  <div className="form-group">
                    <label>Select User</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Choose user</option>
                      {users
                        .filter((item) => item.role !== "admin")
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} - {item.email}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Event</label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      <option value="">Choose event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="primary-btn">
                    Add User
                  </button>
                </form>
              </div>

              <div className="panel-card">
                <div className="panel-header panel-header-wrap">

                  <div className="events-toolbar">
                    <div className="event-filters">
                      <button
                        type="button"
                        className={`filter-btn ${userFilter === "all" ? "active" : ""}`}
                        onClick={() => setUserFilter("all")}
                      >
                        All
                      </button>

                      <button
                        type="button"
                        className={`filter-btn ${userFilter === "admins" ? "active" : ""}`}
                        onClick={() => setUserFilter("admins")}
                      >
                        Admins
                      </button>

                      <button
                        type="button"
                        className={`filter-btn ${userFilter === "users" ? "active" : ""}`}
                        onClick={() => setUserFilter("users")}
                      >
                        Users
                      </button>
                    </div>

                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                {loadingUsers ? (
                  <p className="muted-text">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="muted-text">No users found.</p>
                ) : (
                  <div className="card-list">
                    {filteredUsers.map((item) => (
                      <div key={item.id} className="data-card">
                        <div className="data-card-content">
                          <div className="data-card-top">
                            <div>
                              <h3>{item.name}</h3>
                              <p>{item.email}</p>
                            </div>

                            <div className="user-top-actions">
                              <span
                                className={`role-badge ${
                                  item.role === "admin" ? "admin" : "user"
                                }`}
                              >
                                {item.role}
                              </span>

                              {Number(item.id) !== Number(user.id) && item.role !== "admin" && (
                                <button
                                  type="button"
                                  className="action-btn make-admin-btn"
                                  onClick={() => handleChangeRole(item.id, "admin")}
                                >
                                  Make Admin
                                </button>
                              )}

                              {Number(item.id) !== Number(user.id) && item.role === "admin" && (
                                <button
                                  type="button"
                                  className="action-btn make-user-btn"
                                  onClick={() => handleChangeRole(item.id, "user")}
                                >
                                  Make User
                                </button>
                              )}
                              {Number(item.id) !== Number(user.id) && (
                                <button
                                  type="button"
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteUser(item.id)}
                                >
                                  Delete User
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="data-grid">
                            <div>
                              <span>Email</span>
                              <strong>{item.email}</strong>
                            </div>

                            <div>
                              <span>Role</span>
                              <strong>{item.role}</strong>
                            </div>

                            <div>
                              <span>Joined</span>
                              <strong>{item.created_at || "-"}</strong>
                            </div>

                            <div>
                              <span>User ID</span>
                              <strong>{item.id}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "registrations" && (
  <section className="panel-card">
    <div className="panel-header panel-header-wrap">
      <h2>Registrations</h2>

      <div className="events-toolbar">
        <select
          className="search-input registration-select"
          value={registrationEventFilter}
          onChange={(e) => setRegistrationEventFilter(e.target.value)}
        >
          <option value="all">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <input
          className="search-input"
          type="text"
          placeholder="Search registrations..."
          value={registrationSearch}
          onChange={(e) => setRegistrationSearch(e.target.value)}
        />
      </div>
    </div>

    {loadingRegistrations ? (
      <p className="muted-text">Loading registrations...</p>
    ) : filteredRegistrations.length === 0 ? (
      <div className="empty-state-dashboard">
        <h3>No registrations found</h3>
        <p>No matching registrations were found.</p>
      </div>
    ) : (
      <div className="registration-list">
        {filteredRegistrations.map((registration) => (
          <div key={registration.id} className="registration-card">
            <div className="registration-card-top">
              <div className="registration-avatar">
                {registration.user?.name
                  ? registration.user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div className="registration-content">
                <h3>
                  {registration.user?.name || "Unknown User"}{" "}
                  <span className="registration-role">
                    ({registration.user?.role || "user"})
                  </span>
                </h3>

                <p className="registration-sentence">
                  This user has registered for{" "}
                  <strong>{registration.event?.title || "Unknown Event"}</strong>.
                </p>

                <div className="registration-meta">
                  <span>{registration.user?.email || "No email"}</span>
                  <span>Registration ID: {registration.id}</span>
                  <span>{registration.created_at || "-"}</span>
                </div>
              </div>
            </div>

            <div className="registration-actions">
              {registration.event?.id && (
                <Link
                  to={`/events/${registration.event.id}/participants`}
                  className="action-btn participants-btn"
                >
                  View Participants
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}

          {confirmModal.isOpen && (
            <div className="confirm-overlay">
              <div className="confirm-modal">
                <h3>{confirmModal.title}</h3>
                <p>{confirmModal.message}</p>

                <div className="confirm-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeConfirmModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={confirmModal.onConfirm}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function formatForDateTimeLocal(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default AdminDashboard;