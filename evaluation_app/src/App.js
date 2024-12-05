import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from "./components/Navbar";
import TitleAndText from "./components/TitleAndText";
import ScheduleTest from "./components/ScheduleTest";
import StudentGroup from "./components/StudentGroup";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home color={"#1347bd"}/>} />
        <Route path="/input_topic_and_text" element={<TitleAndText/>}/>
        <Route path="/add-title" element={<TitleAndText/>}/>
        <Route path="/schedule-test" element={<ScheduleTest/>}/>
        <Route path="/group-student" element={<StudentGroup/>}/>
      </Routes>
    </Router>
  );
}

export default App;
