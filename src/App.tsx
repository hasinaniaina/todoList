import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/App.css';
import { lazy, Suspense } from "react";

const Login = lazy(() => import("./pages/login"));
const Signin = lazy(() => import("./pages/signin"));
const Project = lazy(() => import("./components/partials/project"));
const Task = lazy(() => import("./components/partials/task"));

function App() {


  return (
    <BrowserRouter>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Routes>
          <Route path="/*" element={<Login />}></Route>
          <Route path="/project" element={<Project />}></Route>
          <Route path="/project/Task" element={<Task />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signin" element={<Signin />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App;