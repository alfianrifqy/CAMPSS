import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PopupProvider } from './context/PopupContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Hiker Pages
import HikerLayout from './layouts/HikerLayout';
import HikerDashboard from './pages/hiker/Dashboard';
import SchedulePage from './pages/hiker/Schedule';
import ReservationFormPage from './pages/hiker/ReservationForm';
import ReservationSuccessPage from './pages/hiker/ReservationSuccess';
import ReservationDetailPage from './pages/hiker/ReservationDetail';
import TicketPage from './pages/hiker/Ticket';
import ProfilePage from './pages/hiker/Profile';
import MyHikesPage from './pages/hiker/MyHikes';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminScheduleManagement from './pages/admin/ScheduleManagement';
import AdminReservationManagement from './pages/admin/ReservationManagement';
import AdminQRScanner from './pages/admin/QRScanner';
import AdminCheckInReport from './pages/admin/CheckInReport';

function App() {
  return (
    <PopupProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Hiker Routes */}
          <Route path="/hiker" element={<HikerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HikerDashboard />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="reservation" element={<MyHikesPage />} />
              <Route path="reservation/new" element={<ReservationFormPage />} />
              <Route path="reservation/success" element={<ReservationSuccessPage />} />
              <Route path="reservation/:id" element={<ReservationDetailPage />} />
              <Route path="reservation/:id/ticket" element={<TicketPage />} />
              <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="schedule" element={<AdminScheduleManagement />} />
              <Route path="reservations" element={<AdminReservationManagement />} />
              <Route path="scan" element={<AdminQRScanner />} />
              <Route path="reports" element={<AdminCheckInReport />} />
          </Route>
        </Routes>
      </Router>
    </PopupProvider>
  );
}

export default App;
