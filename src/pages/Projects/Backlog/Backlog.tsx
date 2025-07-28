import CreateEpic from "./epic"
import CreateSprint from "./sprint"
import CreateUserStory from "./userstory"
export default function Backlog(){
  return(
    <div>
      <h1>Backlog</h1>
      <CreateEpic />
      <CreateSprint />
      <CreateUserStory />
    </div>
  )
}