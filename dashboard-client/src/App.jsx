import { Routes, Route } from "react-router-dom";
import './App.css'
import Dashboard from "./pages/dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/Profile";
import EditProfile from "./pages/user/EditProfile";
import ChangePassword from "./pages/user/ChangePassword";
import GithubReposWidget from "./components/githubWidgets/Repo";
import GithubStarsWidget from "./components/githubWidgets/Favori";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/github" element={<GithubReposWidget/>} />
        <Route path="/githstar" element={<GithubStarsWidget/>} />
      </Routes>
    </>
  )
}


export default App
