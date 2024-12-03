import ExamCards from "./ExamCards";
import Welcome from "./Welcome";
import StudentCards from "./StudentCards";
import EvaluateAndAnalyzeCards from './EvaluateAndAnalyzeCards';
function Home({color}) {
  return (
    <>
    <Welcome/>
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
