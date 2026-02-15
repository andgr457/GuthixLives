import { Routes, Route } from "react-router-dom";
import GETracker from './pages/GETracker';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/getracker" element={<GETracker />} />
    </Routes>
  );
}
