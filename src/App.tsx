import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import JoinScreen from './pages/JoinScreen';
import CardScreen from './pages/CardScreen';
import StaffScreen from './pages/StaffScreen';
import { getAppMode, setAppMode, getCurrentMemberId } from './store';

function AppRouter() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');

  useEffect(() => {
    if (modeParam === 'member' || modeParam === 'staff') {
      setAppMode(modeParam);
    }
  }, [modeParam]);

  const currentMemberId = getCurrentMemberId();
  const savedMode = getAppMode();

  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/teephyno/join" element={<JoinScreen />} />
      <Route path="/teephyno/card" element={<CardScreen />} />

      {/* Wall QR: scanned by new customers on entry – sends them to join flow */}
      <Route path="/vip" element={<Navigate to="/teephyno/join?mode=member" replace />} />

      {/* Member QR URL: only the staff scanner processes this.
          If a customer accidentally opens it, redirect them to their card. */}
      <Route
        path="/scan/:memberId"
        element={
          currentMemberId
            ? <Navigate to="/teephyno/card" replace />
            : <Navigate to="/teephyno/join?mode=member" replace />
        }
      />

      {/* Staff Routes */}
      <Route path="/staff/teephyno" element={<StaffScreen />} />

      {/* Default Redirection */}
      <Route path="/" element={
        savedMode === 'staff' ? (
          <Navigate to="/staff/teephyno" replace />
        ) : currentMemberId ? (
          <Navigate to="/teephyno/card" replace />
        ) : (
          <Navigate to="/teephyno/join" replace />
        )
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}

export default App;
