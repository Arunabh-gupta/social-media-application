import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import {Home} from './Pages/home'
import {Login} from './Pages/login'
import {Navbar} from './Components/navbar'
import { CreatePost } from './Pages/createPost/createPost'
function App() {
  return (
    <div className="App">
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/create-post" element={<CreatePost/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
