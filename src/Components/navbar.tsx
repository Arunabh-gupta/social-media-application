import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {auth} from '../config/firebase'
import { signOut } from 'firebase/auth';
import './navbar.css'
function Navbar() {
    const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Set up an observer for changes to the user's sign-in state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.log("Something went wrong with logout: "+error)
    }
  }
  return (
    <div className="Navbar">
        <Link to="/"><button>Home</button></Link>
        {auth.currentUser ? 
        <>
            <Link to="/create-post"><button>Create Post</button></Link>
            <div className="UserInfo">
                <h1 className='UserName'>{user.displayName}</h1>
                <img src={user.photoURL?.toString()} alt="" />
            </div>
            <div className="Logout">
              <button  onClick={logout}>Logout</button>
            </div>
        </> :
            <Link to="/login"><button>Login</button></Link>
        }
    </div>
  )
}

export {Navbar}