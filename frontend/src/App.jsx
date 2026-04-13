import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MyEvents from "./pages/MyEvents";
import Participants from "./pages/Participants";
import EventDetails from "./pages/EventDetails";
import AssistantPage from "./pages/AssistantPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

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
    </BrowserRouter>
  );
}

export default App;