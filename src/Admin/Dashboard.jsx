import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Import useNavigate
// Import the CSS file
import { IoLogOut } from "react-icons/io5";
import Logo from './Logo';
const Dashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const items = [
    { id: 1, title: 'Users' },
    { id: 2, title: 'Today Work' },
    { id: 3, title: 'Daily Reward' },
    { id: 4, title: 'Plans' },
    { id: 5, title: 'Website Data' },
    { id: 6, title: 'Payments' },
    { id: 7, title: 'Withdraw' },
    { id: 8, title: 'Offer Headline' },
    { id: 9, title: 'Add Payment' },
    
  ];

  const handleItemClick = (title) => {
    switch (title) {
      case 'Users':
        navigate('/users'); // Navigate to Profile page
        break;
      case 'Today Work':
        navigate('/task'); // Add navigation for other items as needed
        break;
      case 'Daily Reward':
        navigate('/dailybonuss');
        break;
      case 'Plans':
        navigate('/plans');
        break;
      case 'Website Data':
        navigate('/websitedetail');
        break;
    
      case 'Payments':
        navigate('/paymentslist');
        break;
        case 'Withdraw':
          navigate('/withdrawal');
          break;
          case 'Offer Headline':
          navigate('/offers');
          break;
          case 'Add Payment':
            navigate('/addpayment');
            break;
         
      default:
        break;
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <div className='Dashboard'>
      <IoLogOut className='logout' onClick={handleLogout}/>
    <Logo/>
      <p className='sub'>Admin Dashboard</p>
      {/* <div className='Verticle-news'>
        <center>
          <marquee direction="up">
            {data.map((item, index) => (
              <h3 key={index}>
                <span>Name: {item.name}</span> <br />
                <span>Amount: {item.amount}</span>
              </h3>
            ))}
          </marquee>
        </center>
      </div>
      <div className='Horizontal-news'>
        <marquee>
          <h2>
            Offer 1: if any one make 10 reffer. Offer 2: if any one make 10 reffer. Offer 5: if any one make 10 reffer.
          </h2>
        </marquee>
      </div> */}
      <div className="grid-container">
        {items.map(item => (
          <div 
            key={item.id} 
            className="grid-item" 
            onClick={() => handleItemClick(item.title)} 
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
