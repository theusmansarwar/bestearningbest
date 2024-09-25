import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";

const Offers = () => {
  const [offerName, setOfferName] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offers, setOffers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState(null);

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerName) {
      alert('Please enter the offer name.');
      return;
    }

    try {
      const offersRef = ref(database, 'offers');
      if (isEditing && currentOfferId) {
        const offerRef = ref(database, `offers/${currentOfferId}`);
        await set(offerRef, { name: offerName, creationDate: new Date().toISOString() });
        alert('Offer updated successfully!');
      } else {
        const newOfferRef = push(offersRef);
        await set(newOfferRef, { name: offerName, creationDate: new Date().toISOString() });
        alert('Offer added successfully!');
      }

      setOfferName('');
      setShowOfferForm(false);
      setIsEditing(false);
      setCurrentOfferId(null);
    } catch (error) {
      console.error('Error adding or updating offer:', error);
    }
  };

  const handleDelete = async (offerId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this offer?');
    if (confirmDelete) {
      try {
        await remove(ref(database, `offers/${offerId}`));
        alert('Offer deleted successfully!');
      } catch (error) {
        alert('Failed to delete offer: ' + error.message);
      }
    }
  };

  const handleEdit = (offerId, offer) => {
    setOfferName(offer.name);
    setCurrentOfferId(offerId);
    setIsEditing(true);
    setShowOfferForm(true);
  };

  useEffect(() => {
    const offersRef = ref(database, 'offers');
    const unsubscribe = onValue(offersRef, (snapshot) => {
      const offersData = snapshot.val();
      const offersList = offersData ? Object.entries(offersData).map(([key, value]) => ({ id: key, ...value })) : [];
      setOffers(offersList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!showOfferForm ? (
        <>
          <button onClick={() => setShowOfferForm(true)} className='taskbtn'>
            Add Offer
          </button>
          <div className="tasks-list">
            <h2>Available Offers</h2>
            {offers.length > 0 ? (
              offers.map((offer) => (
                <div key={offer.id} className="task-item">
                  <div className='leftside'>
                    <p><b>Offer:</b> {offer.name}</p>
                  </div>
                  <div className="action-area">
                    <FaRegEdit className="edit-icon" onClick={() => handleEdit(offer.id, { name: offer.name })} />
                    <MdOutlineDeleteOutline className="delete-icon" onClick={() => handleDelete(offer.id)} />
                  </div>
                </div>
              ))
            ) : (
              <p>No offers available.</p>
            )}
          </div>
        </>
      ) : (
        <div className='AddProductdiv'>
          <form onSubmit={handleOfferSubmit}>
            <input
              type='text'
              placeholder='Name of Offer'
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
            />
            <button type='submit' className='submit-btn'>
              {isEditing ? 'Update Offer' : 'Submit'}
            </button>
            <button type='button' onClick={() => setShowOfferForm(false)} className='cancel-btn'>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Offers;
