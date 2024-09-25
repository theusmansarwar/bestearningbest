import React, { useState, useEffect } from 'react';
import './Todaywork.css';
import { FaStar } from "react-icons/fa";
import { database, auth } from '../firebase';
import { ref, get, child, set, onValue, update } from 'firebase/database';

const Todaywork = () => {
  const [products, setProducts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [timer, setTimer] = useState({}); // To manage timers for each product
  const [userRatings, setUserRatings] = useState({}); // To track user ratings
  const [planPrice, setPlanPrice] = useState(0); // Renamed to follow naming convention
  const [rewardPrice, setRewardPrice] = useState(0); // Added state to store reward price

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchCompletedTasks(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch the plan price on component mount
  useEffect(() => {
    const fetchPlanPrice = async () => {
      if (!currentUserId) return;

      const planIdRef = ref(database, `users/${currentUserId}/selectedPlanId`);
      try {
        const planIdSnapshot = await get(planIdRef);
        if (planIdSnapshot.exists()) {
          const selectedPlanId = planIdSnapshot.val();
          const planRef = ref(database, `plans/${selectedPlanId}`);

          // Fetch the selected plan details
          const planSnapshot = await get(planRef);
          if (planSnapshot.exists()) {
            const planData = planSnapshot.val();
            const price = Number(planData.price);
            setPlanPrice(price); // Update plan price state
            setRewardPrice(0.0625 * price); // Calculate additional reward
          } else {
            console.error('Plan data not found');
          }
        } else {
          console.error('Selected plan ID not found');
        }
      } catch (error) {
        console.error('Error fetching plan price:', error);
      }
    };

    fetchPlanPrice();
  }, [currentUserId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'dailyTasks'));

        if (snapshot.exists()) {
          const productData = snapshot.val();
          const productsArray = Object.keys(productData).map(key => ({
            id: key,
            ...productData[key]
          }));
          setProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProducts();
  }, []);

  const fetchCompletedTasks = (userId) => {
    const completedTasksRef = ref(database, `completedTasks/${userId}`);
    onValue(completedTasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const completedTasks = snapshot.val();
        const newTimer = {};

        Object.keys(completedTasks).forEach(taskId => {
          const task = completedTasks[taskId];
          const completionTime = new Date(task.completedAt).getTime();
          const currentTime = new Date().getTime();
          const timeElapsed = (currentTime - completionTime) / 1000; // in seconds

          if (timeElapsed < 86400) { // 24 hours in seconds
            newTimer[taskId] = 86400 - timeElapsed; // Remaining time
          }
        });

        setTimer(newTimer);
      }
    });
  };

  const handleStarClick = (productId, index) => {
    // Update the rating state
    setUserRatings((prev) => ({
      ...prev,
      [productId]: index // Store the rating for the specific product
    }));
  };

  const handleSubmit = async (productId) => {
    if (!currentUserId || timer[productId] > 0) return;
  
    // Check if a rating has been provided
    const ratingIndex = userRatings[productId];
    if (!ratingIndex) {
      alert('Please provide a star rating before submitting.');
      return;
    }
  
    const currentDate = new Date().toISOString();
    
    if (rewardPrice === null || isNaN(rewardPrice) || rewardPrice <= 0) {
      console.error('Invalid rewardPrice:', rewardPrice);
      return;
    }
  
    const userRef = ref(database, `users/${currentUserId}`);
    let additionalReward = 0.0025 * planPrice;
  
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const currentCoins = Number(userData.coins) || 0;
      const newCoins = currentCoins + additionalReward;
  
      // Update user coins in the database if rating is provided
      await update(userRef, { coins: newCoins });
  
      // Save completed task with rating
      await set(ref(database, `completedTasks/${currentUserId}/${productId}`), {
        completedAt: currentDate,
        productId,
        userId: currentUserId,
        rating: ratingIndex // Save the user's rating
      });
  
      // Set timer for 24 hours
      setTimer((prev) => ({ ...prev, [productId]: 86400 }));
  
      alert('Task submitted successfully with your rating.');
    }
  };
  

  // Timer effect to decrease the timer value every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        const newTimer = { ...prev };
        for (const key in newTimer) {
          if (newTimer[key] > 0) {
            newTimer[key] -= 1; // Decrease timer by 1 second
          }
        }
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <center><b className='Heading'>Today Task</b></center>
      <div className='todaywork-grid'>
        {products.map((product) => (
          <div key={product.id} className='todaywork-item'>
            <img src={product.imageUrl} className='product-img' alt={product.name} />
            <p><b>{product.name}</b></p>
            <p>Price: <b>RS {product.price}</b></p>
            <div className='rating-area'>
              {[...Array(5)].map((_, index) => {
                const starIndex = index + 1;
                return (
                  <FaStar
                    key={starIndex}
                    className='star-icon'
                    onClick={() => handleStarClick(product.id, starIndex)}
                    color={starIndex <= (userRatings[product.id] || 0) ? 'yellow' : 'grey'}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}
            </div>
            <button 
  className='submit-btn' 
  onClick={() => handleSubmit(product.id)} 
  disabled={timer[product.id] > 0} // Disable button if timer is active
>
  {timer[product.id] > 0 
    ? `(${String(Math.floor(timer[product.id] / 3600)).padStart(2, '0')}h ${String(Math.floor((timer[product.id] % 3600) / 60)).padStart(2, '0')}m ${String(Math.floor(timer[product.id] % 60)).padStart(2, '0')}s)` 
    : 'Submit'}
</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Todaywork;
