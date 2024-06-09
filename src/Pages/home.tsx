import React, { useEffect, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Post } from '../Components/post/post'

export interface PostInterface {
    userId: string,
    postId: string, 
    title: string, 
    description: string,
    username: string
}
function Home() {
    const [postList, setPostList] = useState<PostInterface[] | null>(null)
    const postsRef = collection(db, "posts");
    useEffect(()=>{
        const getPosts = async () => {
            const data = await getDocs(postsRef)
            const postsData = data.docs.map((doc)=>{
                const post = doc.data()
                return {postId: doc.id, ...post} as PostInterface
            })
            setPostList(postsData)
            
        }

        getPosts()
    }, [])
  return (
    <div className="Posts">
        {postList?.map((postInfo) => <Post postInfo={postInfo} />)}
    </div>
  )
}

export {Home}