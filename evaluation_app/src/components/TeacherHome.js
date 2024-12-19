import ExamCards from "./ExamCards";
import Welcome from "./Welcome";
import StudentCards from "./StudentCards";
import EvaluateAndAnalyzeCards from './EvaluateAndAnalyzeCards';
import Navbar from "./Navbar";
function Home({color, title}) {
const name = localStorage.getItem("name");
  return (
    <>
    <Navbar/>
    <Welcome title={title} username={name}/>
<div>
  <ExamCards color={color}></ExamCards>
</div>
<hr />
<div>
  <EvaluateAndAnalyzeCards color={color}/>
</div>
<hr />
<div>
  <StudentCards color={color}></StudentCards>
</div>
</>
  );
}

export default Home;
