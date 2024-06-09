import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { collection, addDoc } from 'firebase/firestore'; 
import { auth, db } from '../../config/firebase.ts';
import './createPost.css'; // Import the CSS file

interface CreatePostData {
  title: string;
  description: string;
}

function CreatePost() {
  const schema = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required')
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const postsRef = collection(db, 'posts');
  const addPost = async (data: CreatePostData) => {
    console.log({ data });
    try {
      await addDoc(postsRef, {
        userId: auth.currentUser?.uid,
        title: data.title,
        description: data.description,
        username: auth.currentUser?.displayName
      });
    } catch (error) {
      console.log(error);
    }
    reset();
  };

  return (
    <div className="Create-Post">
      <form onSubmit={handleSubmit(addPost)}>
        <h1>CREATE POST</h1>
        <input type="text" className="Title" placeholder="Title" {...register('title')} />
        {errors.title && <p className="error-message">{errors.title.message}</p>}
        <textarea placeholder="Description" {...register('description')}></textarea>
        {errors.description && <p className="error-message">{errors.description.message}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export { CreatePost };
