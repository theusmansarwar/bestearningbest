import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";

const Plans = () => {
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!planName || !planPrice) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const plansRef = ref(database, 'plans');
      if (isEditing && currentPlanId) {
        const planRef = ref(database, `plans/${currentPlanId}`);
        await set(planRef, { name: planName, price: planPrice, creationDate: new Date().toISOString(), rating: 0 });
        alert('Plan updated successfully!');
      } else {
        const newPlanRef = push(plansRef);
        await set(newPlanRef, { name: planName, price: planPrice, creationDate: new Date().toISOString(), rating: 0 });
        alert('Plan added successfully!');
      }

      setPlanName('');
      setPlanPrice('');
      setShowPlanForm(false);
      setIsEditing(false);
      setCurrentPlanId(null);
    } catch (error) {
      console.error('Error adding or updating plan:', error);
    }
  };

  const handleDelete = async (planId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this plan?');
    if (confirmDelete) {
      try {
        await remove(ref(database, `plans/${planId}`));
        alert('Plan deleted successfully!');
      } catch (error) {
        alert('Failed to delete plan: ' + error.message);
      }
    }
  };

  const handleEdit = (planId, plan) => {
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setCurrentPlanId(planId);
    setIsEditing(true);
    setShowPlanForm(true);
  };

  useEffect(() => {
    const plansRef = ref(database, 'plans');
    const unsubscribe = onValue(plansRef, (snapshot) => {
      const plansData = snapshot.val();
      const plansList = plansData ? Object.entries(plansData).map(([key, value]) => ({ id: key, ...value })) : [];
      setPlans(plansList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!showPlanForm ? (
        <>
          <button onClick={() => setShowPlanForm(true)} className='taskbtn'>
            Add Daily Plan
          </button>
          <div className="tasks-list">
            <h2>Available Plans</h2>
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
              <p>No plans available.</p>
            )}
          </div>
        </>
      ) : (
        <div className='AddProductdiv'>
          <form onSubmit={handlePlanSubmit}>
            <input type='text' placeholder='Name of plan' value={planName} onChange={(e) => setPlanName(e.target.value)} />
            <input type='number' placeholder='Price' value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} />
            <button type='submit' className='submit-btn'>
              {isEditing ? 'Update Plan' : 'Submit'}
            </button>
            <button type='button' onClick={() => setShowPlanForm(false)} className='cancel-btn'>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Plans;
