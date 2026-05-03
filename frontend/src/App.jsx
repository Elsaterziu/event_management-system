import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MyEvents from "./pages/MyEvents";
import Participants from "./pages/Participants";
import EventDetails from "./pages/EventDetails";
import AssistantPage from "./pages/AssistantPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();

  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ScrollToTop />

      {/* Navbar gjithmonë shfaqet */}
      <Navbar />

      <ToastContainer position="top-right" autoClose={3000} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/events/:eventId/participants" element={<Participants />} />
          <Route path="/events/:id" element={<EventDetails />} />
        </Routes>
      </main>

      {}
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;