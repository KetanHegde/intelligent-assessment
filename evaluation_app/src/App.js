import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TeacherHome from "./components/TeacherHome";
import TitleAndText from "./components/TitleAndText";
import ScheduleTest from "./components/ScheduleTest";
import StudentGroup from "./components/StudentGroup";
import ScheduleTest2 from "./components/ScheduleTest2";
import StudentManage from "./components/StudentManage";
import ExamManager from "./components/CreateManageExam";
import LoginForm from "./components/Login";
import RegisterForm from "./components/Register";
import StudentHome from "./components/StudentHome";
import Logout from "./components/Logout";
import Test from "./components/Test";
import ResultsStudentPage from "./components/ResultStudent";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ResultsTeacherPage from "./components/ResultTeacher";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/teacher-dashboard"
          element={<TeacherHome color={"#1347bd"} title={"EduAssessMate"} />}
        />
        <Route path="/input_topic_and_text" element={<TitleAndText />} />
        <Route path="/add-title" element={<TitleAndText />} />
        <Route path="/schedule-test" element={<ScheduleTest />} />
        <Route path="/group-student" element={<StudentGroup />} />
        <Route path="/schedule-test-2" element={<ScheduleTest2 />}></Route>
        <Route path="/add-manage-students" element={<StudentManage />}></Route>
        <Route path="/create-exam" element={<ExamManager />}></Route>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<RegisterForm />}></Route>
        <Route path="/student-dashboard" element={<StudentHome />}></Route>
        <Route path="/logout" element={<Logout />}></Route>
        <Route path="/test/:evaluationId" element={<Test />} />
        <Route
          path="/results/:evaluationId/:usn"
          element={<ResultsStudentPage />}
        />
        <Route path="/results/:evaluationId" element={<ResultsTeacherPage />} />
      </Routes>
    </Router>
  );
}

export default App;
