import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import AvailabilityPage from "./pages/AvailabilityPage.jsx";
import BookingConfirmationPage from "./pages/BookingConfirmationPage.jsx";
import EventTypesPage from "./pages/EventTypesPage.jsx";
import MeetingsPage from "./pages/MeetingsPage.jsx";
import PublicBookingPage from "./pages/PublicBookingPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate replace to="/event-types" />} />
          <Route path="/event-types" element={<EventTypesPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
        </Route>
        <Route path="/book/:slug" element={<PublicBookingPage />} />
        <Route path="/book/:slug/confirmation/:bookingId" element={<BookingConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
