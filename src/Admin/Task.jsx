import React, { useState, useEffect } from 'react';
import { database, storage } from '../firebase'; // import storage from firebase
import { ref, set, push, remove, onValue } from 'firebase/database';
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // import storage functions

const Task = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]); 
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !productPrice || !productImage) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const tasksRef = ref(database, 'dailyTasks');
      
      let imageUrl = '';
      if (productImage) {
        const imageStorageRef = storageRef(storage, `images/${productImage.name}`); 
        await uploadBytes(imageStorageRef, productImage); 
        imageUrl = await getDownloadURL(imageStorageRef);
      }

      if (isEditing && currentTaskId) {
        const taskRef = ref(database, `dailyTasks/${currentTaskId}`);
        await set(taskRef, {
          name: productName,
          price: productPrice,
          creationDate: new Date().toISOString(),
          imageUrl, // store image URL in database
         
        });
        alert('Task updated successfully!');
      } else {
        const newTaskRef = push(tasksRef);
        await set(newTaskRef, {
          name: productName,
          price: productPrice,
          creationDate: new Date().toISOString(),
          imageUrl, // store image URL in database
      
        });
        alert('Task added successfully!');
      }

      setProductName('');
      setProductPrice('');
      setProductImage(null);
      setShowProductForm(false);
      setIsEditing(false);
      setCurrentTaskId(null);
    } catch (error) {
      console.error('Error adding or updating task:', error);
    }
  };

  const handleCancel = () => {
    setShowProductForm(false);
    setProductName('');
    setProductPrice('');
    setProductImage(null);
  };

  const handleEdit = (task) => {
    setProductName(task.name);
    setProductPrice(task.price);
    setCurrentTaskId(task.id);
    setIsEditing(true);
    setShowProductForm(true);
  };

  const handleDelete = async (taskId) => {
    try {
      const taskRef = ref(database, `dailyTasks/${taskId}`);
      await remove(taskRef);
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    const tasksRef = ref(database, 'dailyTasks');
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const tasksData = snapshot.val();
      const tasksList = tasksData ? Object.entries(tasksData).map(([key, value]) => ({ id: key, ...value })) : [];
      setTasks(tasksList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!showProductForm ? (
        <>
          <button onClick={() => setShowProductForm(true)} className='taskbtn'>
            Add Daily Task Product
          </button>
          <div className="tasks-list">
            <h2>Available Tasks</h2>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className='leftside'>
                  {task.imageUrl && <img className='logo' src={task.imageUrl} alt={task.name} style={{ width: '100px' }} />} 
                    <p>Name: {task.name}</p>
                    <p>Price: {task.price}</p>
             
                  </div>
                  <div className="action-area">
                    <FaRegEdit className="edit-icon" onClick={() => handleEdit(task)} />
                    <MdOutlineDeleteOutline className="delete-icon" onClick={() => handleDelete(task.id)} />
                  </div>
                </div>
              ))
            ) : (
              <p>No tasks available.</p>
            )}
          </div>
        </>
      ) : (
        <div className='AddProductdiv'>
          <form onSubmit={handleProductSubmit}>
            <input type='text' placeholder='Name of product' value={productName} onChange={(e) => setProductName(e.target.value)} />
            <input type='file' accept='image/*' onChange={handleImageChange} />
            <input type='number' placeholder='Price' value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
            <button type='submit' className='submit-btn'>
              {isEditing ? 'Update Task' : 'Submit'}
            </button>
            <button type='button' onClick={handleCancel} className='cancel-btn'>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Task;
