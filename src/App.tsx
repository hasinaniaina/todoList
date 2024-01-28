import { BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./pages/login";
import Signin from "./pages/signin";
import Project from "./components/partials/project";
import { Task } from "./components/partials/task";
import './assets/css/App.css';

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/project" element={<Project />}></Route>
        <Route path="/project/Task" element={<Task />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signin" element={<Signin />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
