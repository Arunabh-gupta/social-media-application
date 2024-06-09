import React, { useEffect, useState } from 'react'
import { PostInterface } from '../../../Pages/home'
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { auth, db } from "../../../config/firebase"
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { MoreHoriz, Edit, Delete, AddCircleOutline, RemoveCircleOutline, ArrowDropDownRounded, ArrowDropUpRounded } from "@mui/icons-material"

import './comments.css';
import { Button } from '@mui/material';

interface Props {
  postInfo: PostInterface
}
interface CommentDesc {
  description: string
}
interface Comment {
  postId: string;
  userId: string;
  username: string;
  description: string;
  commentId: string;
  child_commentIds: string[];
  parentId: string | null;
}


function CommentSection(props: Props) {
  const [commentList, setCommentList] = useState<Comment[]>([])
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyBox, setReplyBox] = useState(false);
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>({})
  const [openOptions, setOpenOptions] = useState<{ [key: string]: boolean }>({})
  const [votes, setVotes] = useState<{ [key: string]: number }>({})
  const [hasUpVoted, setHasUpVoted] = useState<{ [key: string]: {[key : string]: boolean} }>({})
  const [hasDownVoted, setHasDownVoted] = useState<{ [key: string]: {[key : string]: boolean} }>({})

  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [editContent, setEditContent] = useState<{ [key: string]: string }>({});

  const schema = yup.object().shape({
    description: yup.string().required("Description cannot be empty")
  })
  const commentForm = useForm({
    resolver: yupResolver(schema)
  })

  const replyForm = useForm({
    resolver: yupResolver(schema)
  })

  const commentsRef = collection(db, "comments");

  const onSubmitComment = (data: CommentDesc) => {
    addComment(data);
  }
  const onSubmitReply = (data: CommentDesc) => {
    addComment(data, replyTo)
    replyForm.reset();
  }
  const addComment = async (data: CommentDesc, parentId: string | null = null) => {
    const newCommentRef = doc(commentsRef);
    const newCommentId = newCommentRef.id;
    try {
      await setDoc(newCommentRef, {
        postId: props.postInfo.postId,
        userId: props.postInfo.userId,
        username: auth.currentUser?.displayName,
        description: data.description,
        commentId: newCommentId,
        parentId: parentId,
        upvotes: 0
      })
      commentForm.reset();
      setReplyTo(null);
      getComments();
    } catch (error) {
      console.log("Something went wrong while adding the comment : " + error)
    }

  }
  const getComments = async () => {
    const q = query(commentsRef, where('postId', '==', props.postInfo.postId));
    const data = await getDocs(q);
    const commentsList = data.docs.map((doc) => ({
      commentId: doc.id,
      ...doc.data()
    })) as Comment[];

    setCommentList(commentsList);
  };
  // Reply 
  const onClickingReply = (commentId: string) => {
    setReplyTo(commentId);
    setReplyBox(!replyBox)
  };
  const toggleReplies = (commentId: string) => {
    setOpenReplies((prevOpenReplies) => ({
      ...prevOpenReplies,
      [commentId]: !prevOpenReplies[commentId]
    }))
  }
  useEffect(() => {
    getComments();
  }, [])

  // Edit and Delete Comments
  const toggleOptions = (commentId: string) => {
    setOpenOptions((prevOpenOptions) => ({
      ...prevOpenOptions,
      [commentId]: !prevOpenOptions[commentId]
    }))
  }
  const deleteComment = async (commentId: string) => {
    const docRef = doc(db, "comments", commentId);
    console.log(docRef.path);
    try {
      await deleteDoc(docRef);
      console.log("Successfully deleted the comment")
    } catch (error) {
      console.log("There was some error while deleting the comment: " + error)
    }
    getComments()
  }
  // comment editing
  const editComment = async (commentId: string) => {
    if (!auth.currentUser) return;
  
    const commentRef = doc(db, "comments", commentId);
    const newContent = editContent[commentId];
  
    try {
      await setDoc(commentRef, { description: newContent }, { merge: true });
      setIsEditing((prevEditing) => ({
        ...prevEditing,
        [commentId]: false,
      }));
      getComments();
    } catch (error) {
      console.log("Error updating comment: " + error);
    }
  };

  const handleEditClick = (commentId: string, currentContent: string) => {
    setIsEditing((prevEditing) => ({
      ...prevEditing,
      [commentId]: true,
    }));
    setEditContent((prevContent) => ({
      ...prevContent,
      [commentId]: currentContent,
    }));
  };
  
  const handleInputChange = (commentId: string, value: string) => {
    setEditContent((prevContent) => ({
      ...prevContent,
      [commentId]: value,
    }));
  };
  
  // comment editing
  // managing upvotes and downvotes
  const upVote = async (commentId : string) => {
    const commentRef = doc(db, "comments", commentId);
    const votesRef = collection(db, "votes");
    const q = query(votesRef, where("commentId", "==", commentId));
    const data = await getDocs(q);
    const voteDocs = data.docs.map((doc) => doc.data());
    let totalVotes = 0;
    voteDocs.map((vote)=>{
      if(vote.whoUpVoted !== null){
        totalVotes++;
        if(vote.whoUpVoted === auth.currentUser?.uid){
          setHasUpVoted((prevUpVotes) => ({
            ...prevUpVotes,
            [commentId]: {
              ...prevUpVotes[commentId],
              [auth.currentUser!.uid]: true
            }
          }));
        }
      }
      if(vote.whoDownVoted !== null){
        totalVotes--;
        if(vote.whoUpVoted === auth.currentUser?.uid){
          setHasDownVoted((prevDownVotes) => ({
            ...prevDownVotes,
            [commentId]: {
              ...prevDownVotes[commentId],
              [auth.currentUser!.uid]: true
            }
          }));
        }
      }
    })
    // console.log(hasUpVoted[commentId]?.[auth.currentUser?.uid]);
    if(auth.currentUser && !hasUpVoted[commentId]?.[auth.currentUser?.uid]){
      try {
        await addDoc(votesRef, {
          commentId: commentId,
          whoUpVoted: auth.currentUser.uid,
          whoDownVoted: null
        })
      } catch (error) {
        console.log("Something went wrong when upvoting : "+error);
      }
    }
    else {
      console.log("user already upvoted")
      return;
    }
    const updateVotes = (commentId: string, totalVotes: number) => {
      setVotes((prevVotes) => ({
        ...prevVotes,
        [commentId]: totalVotes,
      }));
    };
    updateVotes(commentId, totalVotes);
  }
  const downVote = async (commentId : string) => {
    const commentRef = doc(db, "comments", commentId);
    const votesRef = collection(db, "votes");
    const q = query(votesRef, where("commentId", "==", commentId));
    const data = await getDocs(q);
    const voteDocs = data.docs.map((doc) => doc.data());
    let totalVotes = 0;
    voteDocs.map((vote)=>{
      if(vote.whoUpVoted !== null){
        totalVotes++;
        if(vote.whoUpVoted === auth.currentUser?.uid){
          setHasUpVoted((prevUpVotes) => ({
            ...prevUpVotes,
            [commentId]: {
              ...prevUpVotes[commentId],
              [auth.currentUser!.uid]: true
            }
          }));
        }
      }
      if(vote.whoDownVoted !== null){
        totalVotes--;
        if(vote.whoUpVoted === auth.currentUser?.uid){
          setHasDownVoted((prevDownVotes) => ({
            ...prevDownVotes,
            [commentId]: {
              ...prevDownVotes[commentId],
              [auth.currentUser!.uid]: true
            }
          }));
        }
      }
    })

    if(auth.currentUser && !hasDownVoted[commentId]?.[auth.currentUser?.uid]){
      try {
        await addDoc(votesRef, {
          commentId: commentId,
          whoUpVoted: null,
          whoDownVoted: auth.currentUser.uid
        })
      } catch (error) {
        console.log("Something went wrong when upvoting : "+error);
      }
    }
    else{
      console.log("user already downvoted")
      return;
    }
    const updateVotes = (commentId: string, totalVotes: number) => {
      setVotes((prevVotes) => ({
        ...prevVotes,
        [commentId]: totalVotes,
      }));
    };
    updateVotes(commentId, totalVotes);

  }
  // managing upvotes and downvotes
  const renderComments = (parentId: string | null) => {
    return commentList
      .filter(comment => comment.parentId === parentId)
      .map((comment) => {
        return (
          <div className="Comment" key={comment.commentId}>
            <div className="Comment-Header">
              <h4 className="User-Name">{comment.username}</h4>
            </div>
            <div className="Comment-Body">
              {isEditing[comment.commentId] ? (
                <textarea
                  value={editContent[comment.commentId]}
                  onChange={(e) => handleInputChange(comment.commentId, e.target.value)}
                />
              ) : (
                <p>{comment.description}</p>
              )}
            </div>
            <div className="Comment-Footer">
              <a onClick={() => toggleReplies(comment.commentId)}>
                {openReplies[comment.commentId] ? <RemoveCircleOutline /> : <AddCircleOutline />}
              </a>
              <div className="Upvotes-Downvotes">
                <a onClick={() => { upVote(comment.commentId) }}><ArrowDropUpRounded /></a>
                <span>{votes[comment.commentId]}</span>
                <a onClick={() => { downVote(comment.commentId) }}><ArrowDropDownRounded /></a>
              </div>
              <button onClick={() => { onClickingReply(comment.commentId) }}>Reply</button>
              <Button onClick={() => { toggleOptions(comment.commentId) }}><MoreHoriz /></Button>
              {openOptions[comment.commentId] && <>
                <div className="Option-List">
                  {isEditing[comment.commentId] ? (
                    <>
                      <button onClick={() => editComment(comment.commentId)}>Save</button>
                      <button onClick={() => setIsEditing((prevEditing) => ({
                        ...prevEditing,
                        [comment.commentId]: false
                      }))}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditClick(comment.commentId, comment.description)}><Edit />Edit</button>
                  )}
                  <button onClick={() => deleteComment(comment.commentId)}><Delete />Delete</button>
                </div>
              </>}
            </div>
            {replyBox && replyTo === comment.commentId && (
              <div className="Reply-Section">
                <div className="Comment-Box">
                  <form onSubmit={replyForm.handleSubmit(onSubmitReply)}>
                    <div className="Input-Body">
                      <textarea placeholder="What's on your mind...." {...replyForm.register('description')}></textarea>
                      <div className="Empty-Comment-Error-Msg">
                        {replyForm.formState.errors.description && <p className="error-message">{replyForm.formState.errors.description.message}</p>}
                      </div>
                    </div>
                    <div className="submit-button">
                      <button type='submit'>Comment</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {openReplies[comment.commentId] && (
              <div className="Replies">
                {renderComments(comment.commentId)}
              </div>
            )}
          </div>
        )
      })
  }
  

  return (
    <div className="Comment-Section">
      <div className="Comment-Box">
        <form onSubmit={commentForm.handleSubmit(onSubmitComment)}>
          <div className="Input-Body">
            <textarea placeholder="What's on your mind...." {...commentForm.register('description')}></textarea>
            <div className="Empty-Comment-Error-Msg">
              {commentForm.formState.errors.description && <p className="error-message">{commentForm.formState.errors.description.message}</p>}
            </div>
          </div>
          <div className="submit-button">
            <button type='submit'>Comment</button>
          </div>
        </form>
      </div>
      <div className="Comment-List">
        {renderComments(null)}
      </div>
    </div>
  )
}

export { CommentSection }