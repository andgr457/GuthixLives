import { Routes, Route } from "react-router-dom";
import GETracker from './pages/GETracker';
import Home from './pages/Home';
import GEPlannerItem from './pages/GEPlannerItem';
import GEPlanner from './pages/GEPlanner';
import ToonPlanner from './pages/ToonPlanner';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/toonPlanner" element={<ToonPlanner />} />
      <Route path="/getracker" element={<GETracker />} />
      <Route path='/geplanner' element={<GEPlanner />} />
      <Route path="/geplanner/:itemName" element={<GEPlannerItem />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
