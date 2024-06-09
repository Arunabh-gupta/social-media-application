import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import {Home} from './Pages/home'
import {Login} from './Pages/login'
import {Navbar} from './Components/navbar'
import { CreatePost } from './Pages/createPost/createPost'
import { Testing } from './Pages/testing'
function App() {
  return (
    <div className="App">
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/create-post" element={<CreatePost/>}/>
          <Route path="/testing" element={<Testing/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
