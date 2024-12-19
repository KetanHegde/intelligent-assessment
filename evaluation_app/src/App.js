import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from "./components/Navbar";
import TitleAndText from "./components/TitleAndText";
import ScheduleTest from "./components/ScheduleTest";
import StudentGroup from "./components/StudentGroup";
import ScheduleTest2 from "./components/ScheduleTest2";
import StudentManage from "./components/StudentManage";
import ExamManager from "./components/CreateManageExam";
import LoginForm from "./components/Login";
import RegisterForm from "./components/Register";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home color={"#1347bd"} title={"EduAssessMate"}/>} />
        <Route path="/input_topic_and_text" element={<TitleAndText/>}/>
        <Route path="/add-title" element={<TitleAndText/>}/>
        <Route path="/schedule-test" element={<ScheduleTest/>}/>
        <Route path="/group-student" element={<StudentGroup/>}/>
        <Route path="/schedule-test-2" element={<ScheduleTest2/>}></Route>
        <Route path="/add-manage-students" element={<StudentManage/>}></Route>
        <Route path="/create-exam" element={<ExamManager/>}></Route>
        <Route path="/login" element={<LoginForm/>}></Route>
        <Route path="/register" element={<RegisterForm/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
