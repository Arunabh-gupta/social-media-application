import { useEffect, useState } from 'react'
import { PostInterface } from '../../Pages/home'
import './post.css'
import { collection, query, addDoc, where, getDocs, doc, deleteDoc } from "firebase/firestore"
import { auth, db } from "../../config/firebase"
import {ThumbUpAltRounded, ThumbDownAltRounded, ForumSharp} from '@mui/icons-material';

import { yellow } from '@mui/material/colors';
// Comment Section
// import { CommentSection } from './comments/commentsection'
import { CommentSection } from './comments/Comments_Section'
interface Props {
    postInfo: PostInterface
}
interface Like {
    userId: string,
}

function Post(props: Props) {

    const [likes, setLikes] = useState<Like[] | null>(null)
    const [hasUserLiked, setHasUserLiked] = useState(false);
    const [commentList, setCommentList] = useState(false)
    const likesRef = collection(db, 'likes');
    const getLikes = async () => {
        try {
            const q = query(likesRef, where("postId", "==", props.postInfo.postId))
            const data = await getDocs(q);
            const likesList = data.docs.map((doc) => {
                return {
                    userId: doc.data().userId
                }
            })
            setLikes(likesList)
        } catch (error) {
            console.log("Something went wrong while fetching the likes : " + error)
        }
    }
    const addLike = async () => {
        try {
            await addDoc(likesRef, {
                userId: auth.currentUser?.uid,
                postId: props.postInfo.postId
            })
            console.log("Like added successfully")
            setHasUserLiked(true)
        } catch (error) {
            console.log("Coundn't add like. Something went wrong: " + error);
        }
    }
    const removeLike = async () => {
        try {
          const userId = auth.currentUser?.uid;
          if (!userId) {
            throw new Error("User not authenticated");
          }
      
          setHasUserLiked(false);
      
          const docQuery = query(
            likesRef, 
            where("postId", "==", props.postInfo.postId),
            where("userId", "==", userId)
          );
      
          const querySnapshot = await getDocs(docQuery);
          
          querySnapshot.forEach(async (document) => {
            await deleteDoc(doc(likesRef, document.id));
            console.log("Like has been removed")
          });
        } catch (error) {
          console.error("Error removing like: ", error);
        }
      }
    const hasLiked = () => {
        likes?.map((like) => {
            if (like.userId === auth.currentUser?.uid) {
                setHasUserLiked(true);
            }
        })
    }
    useEffect(() => {
        getLikes();
        hasLiked();
    }, [])

    // comments
  
    const openComments = () =>{
        setCommentList(!commentList)
    }

    return (
        <div className="Post">
            <div className="Header">
                <h2>{props.postInfo.title}</h2>
            </div>
            <div className="Body">
                <p>{props.postInfo.description}</p>
            </div>
            <div className="Footer">
                <h4>{props.postInfo.username}</h4>
            </div>
            <div className="Reactions">
                <div className="Like-Symbol">
                    {auth.currentUser &&
                        (!hasUserLiked ?
                            <ThumbUpAltRounded sx={{ color: yellow[600] }} onClick={addLike}/> :
                            <>
                                <ThumbDownAltRounded sx={{ color: yellow[600] }} onClick={removeLike}/>
                                <h4>{likes?.length}</h4>
                            </>
                            )} 
                </div>
                <div className="Comment-Symbol">
                    <ForumSharp onClick={openComments}/>
                </div>
            </div>
            {commentList && <CommentSection postInfo={props.postInfo}/>}
        </div>
    )
}

export { Post }