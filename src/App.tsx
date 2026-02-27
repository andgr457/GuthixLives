import { Routes, Route } from "react-router-dom";
import GETracker from './pages/GETracker';
import Home from './pages/Home';
import GEPlannerItem from './pages/GEPlannerItem';
import GEPlanner from './pages/GEPlanner';
import ToonPlanner from './pages/ToonPlanner';
import ToonTasks from './pages/ToonTasks';
import Events from './pages/Events';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/events' element={<Events />} />
      <Route path="/toonPlanner" element={<ToonPlanner />} />
      <Route path="/getracker" element={<GETracker />} />
      <Route path='/geplanner' element={<GEPlanner />} />
      <Route path="/geplanner/:itemName" element={<GEPlannerItem />} />
      <Route path='/toonTasks/:toonName' element={<ToonTasks />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
