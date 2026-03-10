import { Routes, Route } from "react-router-dom";
import Events from './pages/events/Events';
import GEPlanner from './pages/ge/GEPlanner';
import GEPlannerItem from './pages/ge/GEPlannerItem';
import GETracker from './pages/ge/GETracker';
import Home from './pages/Home';
import ToonPlanner from './pages/toon/ToonPlanner';
import ToonTasks from './pages/toon/ToonTasks';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/events' element={<Events />} />
      <Route path="/toonplanner" element={<ToonPlanner />} />
      <Route path="/getracker" element={<GETracker />} />
      <Route path='/geplanner' element={<GEPlanner />} />
      <Route path="/geplanner/:itemName" element={<GEPlannerItem />} />
      <Route path='/toonTasks/:toonName' element={<ToonTasks />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
