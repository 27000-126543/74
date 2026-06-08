import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Hotel from "@/pages/Hotel";
import Staff from "@/pages/Staff";
import Operations from "@/pages/Operations";
import Events from "@/pages/Events";
import Market from "@/pages/Market";
import Guild from "@/pages/Guild";
import Analytics from "@/pages/Analytics";
import Leaderboard from "@/pages/Leaderboard";
import { useGameStore } from "@/store/gameStore";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return localStorage.getItem('playerId');
  });
  const { player, fetchAll } = useGameStore();

  useEffect(() => {
    const checkStorage = () => {
      setPlayerId(localStorage.getItem('playerId'));
    };
    window.addEventListener('storage', checkStorage);
    return () => window.removeEventListener('storage', checkStorage);
  }, []);

  useEffect(() => {
    if (playerId && !player?.id) {
      fetchAll();
    }
  }, [playerId, player?.id, fetchAll]);

  if (!playerId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/hotel"
          element={
            <PrivateRoute>
              <Layout>
                <Hotel />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <Layout>
                <Staff />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/operations"
          element={
            <PrivateRoute>
              <Layout>
                <Operations />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Layout>
                <Events />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/market"
          element={
            <PrivateRoute>
              <Layout>
                <Market />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/guild"
          element={
            <PrivateRoute>
              <Layout>
                <Guild />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Layout>
                <Analytics />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Layout>
                <Leaderboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
