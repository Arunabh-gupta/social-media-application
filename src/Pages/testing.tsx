import React from 'react'
import { db } from '../config/firebase'
import {doc, collection, setDoc} from "firebase/firestore"
function Testing() {
    const commentsRef = collection(db, "comments");
    const docRef = doc(commentsRef);
    console.log(docRef.id)
    const handlebuttonclick = async () => {
        await setDoc(docRef, {
            description: "this is a test comment",
            username: "test user",
            postId: "random ID",
            timestamp: new Date(),
            userId: "random user"
        })
        console.log("Old comment updated. Old comment ID: "+docRef.id)
    }
  return (
    <>
    <button onClick={handlebuttonclick}>get id</button>
    </>
  )
}

export {Testing}