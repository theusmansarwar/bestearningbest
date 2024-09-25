import React, { useState, useEffect } from 'react';
import './DailyReward.css';
import { database, auth } from '../firebase';
import { ref, get, set, update, onValue } from 'firebase/database';

const DailyReward = () => {
  const [products, setProducts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [timers, setTimers] = useState({}); 
  const [rewardToClaim, setRewardToClaim] = useState(null);
  const [planPrice, setPlanPrice] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchCompletedTasks(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPlanPrice = async () => {
      if (!currentUserId) return;

      const planIdRef = ref(database, `users/${currentUserId}/selectedPlanId`);
      const planIdSnapshot = await get(planIdRef);
      if (planIdSnapshot.exists()) {
        const selectedPlanId = planIdSnapshot.val();
        const planRef = ref(database, `plans/${selectedPlanId}`);
        const planSnapshot = await get(planRef);
        if (planSnapshot.exists()) {
          const price = Number(planSnapshot.val().price);
          setPlanPrice(price);
        }
      }
    };

    fetchPlanPrice();
  }, [currentUserId]);

  useEffect(() => {
    const fetchProducts = async () => {
      const dbRef = ref(database);
      const snapshot = await get(ref(database, 'dailyBonuses'));
      if (snapshot.exists()) {
        const productData = snapshot.val();
        const productsArray = Object.keys(productData).map(key => ({
          id: key,
          ...productData[key]
        }));
        setProducts(productsArray);
      }
    };
    fetchProducts();
  }, []);

  const fetchCompletedTasks = (userId) => {
    const completedTasksRef = ref(database, `completedBonuses/${userId}`);
    onValue(completedTasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const completedTasks = snapshot.val();
        const newTimers = {};
        Object.keys(completedTasks).forEach(taskId => {
          const completionTime = new Date(completedTasks[taskId].completedAt).getTime();
          const currentTime = new Date().getTime();
          const timeElapsed = (currentTime - completionTime) / 1000;

          if (timeElapsed < 86400) {
            newTimers[taskId] = 86400 - timeElapsed; // 24-hour timer
          }
        });
        setTimers(newTimers);
      }
    });
  };

  const handleVisitClick = (rewardId, rewardUrl) => {
    setTimers(prev => ({ ...prev, [rewardId]: 10 })); // Start 10-second countdown
    setRewardToClaim(rewardId);
  
    // Open the reward URL in a new tab
    if (rewardUrl && rewardUrl.startsWith('http')) {
      window.open(rewardUrl, '_blank'); // Open the URL in a new tab
    } else {
      console.error('Invalid URL');
    }
  };

  const handleSubmit = async (rewardId) => {
    if (!currentUserId || timers[rewardId] > 0) return;

    const currentDate = new Date().toISOString();
    let additionalReward = 0.0625 * planPrice;

    const userRef = ref(database, `users/${currentUserId}`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const currentCoins = Number(userSnapshot.val().ecoins) || 0;
      const newCoins = currentCoins + additionalReward;

      await update(userRef, { ecoins: newCoins });
      await set(ref(database, `completedBonuses/${currentUserId}/${rewardId}`), {
        completedAt: currentDate,
        productId: rewardId,
        userId: currentUserId
      });

      setTimers(prev => ({ ...prev, [rewardId]: 86400 })); // Start 24-hour timer
      setRewardToClaim(null); // Reset after claiming
    }
  };

  // Timer effect to decrease the timer value every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(key => {
          if (newTimers[key] > 0) {
            newTimers[key] -= 1;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <center><b className='Heading'>Daily Bonus</b></center>
      <div className='todaywork-grid'>
        {products.map((reward) => (
          <div className="todaywork-item" key={reward.id}>
            <p>Price: <b>RS {reward.price}</b></p>

            {timers[reward.id] && timers[reward.id] <= 10 ? (
              <button className='wallet-buttons' disabled>
                Wait ({Math.floor(timers[reward.id])}s)
              </button>
            ) : (
              <>
                {!timers[reward.id] && rewardToClaim !== reward.id && (
                  <button
                    className='wallet-buttons'
                    onClick={() => handleVisitClick(reward.id, reward.name)} // Assuming reward.name is the URL
                  >
                    Visit
                  </button>
                )}

                {/* Show Claim Reward button after 10-second timer */}
                {timers[reward.id] === 0 && rewardToClaim === reward.id && (
                  <button className='submit-btn' onClick={() => handleSubmit(reward.id)}>
                    Claim Reward
                  </button>
                )}
              </>
            )}

            {/* Show 24-hour timer after claiming */}
            {timers[reward.id] > 10 && (
   
      <button className='wallet-buttons' style={{ backgroundColor: 'gray' }} disabled>
        ({Math.floor(timers[reward.id] / 3600)}h {Math.floor((timers[reward.id] % 3600) / 60)}m {Math.floor(timers[reward.id] % 60)}s)
      </button>

            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DailyReward;
