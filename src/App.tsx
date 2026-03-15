import { Routes, Route } from "react-router-dom";
import Events from './pages/events/Events';
import Home from './pages/Home';
import CharacterList from './pages/characters/CharacterList';
import CharacterGEItems from './pages/characters/CharacterGEItems';
import GEPlanner from './pages/ge/GEPlanner';
import GEPlannerItem from './pages/ge/GEPlannerItem';
import GETracker from './pages/ge/GETracker';
import ToonPlanner from './pages/toon/ToonPlanner';
import ToonTasks from './pages/toon/ToonTasks';
import CharacterGEOrderPlanner from './pages/characters/CharacterGEOrders';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/characters' element={<CharacterList />} />
      <Route path="/characters/:characterId/ge-items" element={<CharacterGEItems />} />
      <Route path="/characters/:characterId/ge-orders" element={<CharacterGEOrderPlanner />} />

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
