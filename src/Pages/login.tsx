import React, { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { provider, auth } from '../config/firebase'
import { useNavigate } from 'react-router-dom'
function Login() {
    const navigate = useNavigate();

    const signIn = async () => {
        try {
            await signInWithPopup(auth, provider)
            navigate("/")
        } catch (error) {
            console.log("Error while logging in: "+error)
        }
    }
    
  return (
    <div className='Login'>
        <h3>Sign In With Google</h3>
        <button onClick={signIn}>Sign In</button>
    </div>
  )
}

export {Login}