import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import './Plans.css'; // Import common styles

const Dailybonus = () => {
  const [bonusName, setBonusName] = useState('');
  const [bonusPrice, setBonusPrice] = useState('');
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  useEffect(() => {
    const plansRef = ref(database, 'dailyBonuses');
    const unsubscribe = onValue(plansRef, (snapshot) => {
      const plansData = snapshot.val();
      const plansList = plansData ? Object.entries(plansData).map(([key, value]) => ({ id: key, ...value })) : [];
      setPlans(plansList);
    });

    return () => unsubscribe();
  }, []);

  const handleBonusSubmit = async (e) => {
    e.preventDefault();
    if (!bonusName || !bonusPrice) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const bonusesRef = ref(database, 'dailyBonuses');
      if (isEditing && currentPlanId) {
        const bonusRef = ref(database, `dailyBonuses/${currentPlanId}`);
        await set(bonusRef, { name: bonusName, price: bonusPrice, creationDate: new Date().toISOString(), rating: 0 });
        alert('Bonus updated successfully!');
      } else {
        const newBonusRef = push(bonusesRef);
        await set(newBonusRef, { name: bonusName, price: bonusPrice, creationDate: new Date().toISOString(), rating: 0 });
        alert('Bonus added successfully!');
      }

      setBonusName('');
      setBonusPrice('');
      setShowBonusForm(false);
      setIsEditing(false);
      setCurrentPlanId(null);
    } catch (error) {
      console.error('Error adding or updating bonus:', error);
    }
  };

  const handleDelete = async (planId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this bonus?');
    if (confirmDelete) {
      try {
        await remove(ref(database, `dailyBonuses/${planId}`));
        alert('Bonus deleted successfully!');
      } catch (error) {
        alert('Failed to delete bonus: ' + error.message);
      }
    }
  };

  const handleEdit = (planId, plan) => {
    setBonusName(plan.name);
    setBonusPrice(plan.price);
    setCurrentPlanId(planId);
    setIsEditing(true);
    setShowBonusForm(true);
  };

  return (
    <div>
      {!showBonusForm ? (
        <>
          <button onClick={() => setShowBonusForm(true)} className='taskbtn'>
            Add Daily Bonus
          </button>
          <div className="tasks-list">
            <h2>Available Bonuses</h2>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <div key={plan.id} className="plan-item">
                    <div className='leftside'>
                  <p>Name: {plan.name}</p>
                  <p>Price: {plan.price}</p>
                  </div>
                  <div className="action-area">
                    <FaRegEdit className="edit-icon" onClick={() => handleEdit(plan.id, { name: plan.name, price: plan.price })} />
                    <MdOutlineDeleteOutline className="delete-icon" onClick={() => handleDelete(plan.id)} />
                  </div>
                </div>
              ))
            ) : (
              <p>No bonuses available.</p>
            )}
          </div>
        </>
      ) : (
        <div className='AddProductdiv'>
          <form onSubmit={handleBonusSubmit}>
            <input type='text' placeholder='Name of bonus' value={bonusName} onChange={(e) => setBonusName(e.target.value)} />
            <input type='number' placeholder='Price' value={bonusPrice} onChange={(e) => setBonusPrice(e.target.value)} />
            <button type='submit' className='submit-btn'>
              {isEditing ? 'Update Bonus' : 'Submit'}
            </button>
            <button type='button' onClick={() => setShowBonusForm(false)} className='cancel-btn'>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dailybonus;
