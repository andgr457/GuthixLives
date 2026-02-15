import { Routes, Route, Navigate } from "react-router-dom";
import GETracker from './pages/GETracker';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/getracker" />} />
      <Route path="/getracker" element={<GETracker />} />
    </Routes>
  );
}
