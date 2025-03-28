import React, { useState, useEffect } from 'react';
import { 
  User, 
  Coins, 
  Plus, 
  LogOut, 
  Globe, 
  Mic, 
  Calendar,
  Download,
  Trash2,
  Edit3,
  Save,
  ChevronRight
} from 'lucide-react';
import './ProfilePage.css';
import { getProfile, updateProfile, getSavedProjects } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, projectsData] = await Promise.all([
        getProfile(),
        getSavedProjects()
      ]);
      setUserInfo(userData);
      setSavedProjects(projectsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile({
        name: userInfo.name,
        email: userInfo.email,
        language: userInfo.language,
        voicePreference: userInfo.voicePreference
      });
      setUserInfo(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        // Assuming there's a delete endpoint - you'll need to implement this in your authService
        await deleteProject(projectId);
        setSavedProjects(savedProjects.filter(project => project._id !== projectId));
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userInfo) return <div>No user data found</div>;

  const calculateDaysUntilRenewal = () => {
    const lastPurchase = userInfo.purchaseHistory[userInfo.purchaseHistory.length - 1];
    if (!lastPurchase) return 0;
    const renewalDate = new Date(lastPurchase.date.$date);
    renewalDate.setMonth(renewalDate.getMonth() + 1); // Assuming monthly renewal
    const days = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="header-content">
          <div className="user-info">
          <div className="avatar">
                {getInitials(userInfo.name)}
            </div>
            <div className="user-details">
              <h1>{userInfo.name}</h1>
              <p>{userInfo.email}</p>
            </div>
          </div>
          <div className="token-info">
            <div className="token-balance">
              <Coins className="token-icon" />
              <span>{userInfo.tokens} Tokens</span>
            </div>
            <Link to='/buy-tokens' className="buy-tokens-btn">
              <Plus size={18} />
              Buy More Tokens
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </section>

      <div className="profile-content">
        {/* User Info Section */}
        <section className="profile-section user-info-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group-profile">
              <label>Full Name</label>
              <div className="input-group">
                <input
                  type="text"
                  value={userInfo.name}
                  disabled={!isEditing}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                />
                {!isEditing && (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="form-group-profile">
              <label>Email</label>
              <input type="email" value={userInfo.email} disabled />
            </div>
            <div className="form-group-profile">
              <label>
                <Globe size={16} />
                Preferred Language
              </label>
              <select
                value={userInfo.language}
                disabled={!isEditing}
                onChange={(e) => setUserInfo({ ...userInfo, language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div className="form-group-profile">
              <label>
                <Mic size={16} />
                AI Voice Preference
              </label>
              <select
                value={userInfo.voicePreference}
                disabled={!isEditing}
                onChange={(e) => setUserInfo({ ...userInfo, voicePreference: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Robotic">Robotic</option>
              </select>
            </div>
          </div>
          {isEditing && (
            <div className="button-group">
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </section>

        {/* Subscription Section */}
        <section className="profile-section subscription-section">
          <h2>Subscription Details</h2>
          <div className="subscription-info">
            <div className="current-plan">
              <h3>Current Plan</h3>
              <div className="plan-details">
                <span className="plan-name">{userInfo.plan}</span>
                <div className="renewal-info">
                  <Calendar size={16} />
                  <span>Renews in {calculateDaysUntilRenewal()} days</span>
                </div>
              </div>
            </div>
            <div className="purchase-history">
              <h3>Purchase History</h3>
              <div className="history-list">
                {userInfo.purchaseHistory.map((purchase) => (
                  <div key={purchase._id.$oid} className="history-item">
                    <div className="purchase-date">
                      {formatDate(purchase.date)}
                    </div>
                    <div className="purchase-details">
                      <span className="plan-name">{purchase.plan}</span>
                      <span className="amount">₹{purchase.amount}</span>
                      <span className="tokens">+{purchase.tokens} Tokens</span>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Creations Section */}
        <section className="profile-section creations-section">
          <h2>Your AI Creations</h2>
          <div className="creations-grid">
            {savedProjects.map((project) => (
              <div key={project._id} className="creation-card">
                <div className="creation-thumbnail">
                  <img src={project.thumbnailUrl} alt={project.seo.title} />
                </div>
                <div className="creation-details">
                  <h3>{project.seo.title}</h3>
                  <p>{formatDate(project.createdAt)}</p>
                  <p>Platform: {project.platform}</p>
                  <p>Rating: {project.rating || 'Not rated'}</p>
          
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};



export default ProfilePage;