import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, Home, Wand2, User, LogOut , FileVideo} from 'lucide-react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../config/api";

const Navbar = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [credit, setCredit] = useState(0);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    // Redirect to home
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleBuyTokens = () => {
    navigate('/buy-tokens');
  };

  

  // Get first letter of name for avatar
  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : '?';
  };
  
  useEffect(() => { 
    const fetchCredit = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        const res = await axios.get(`${BASE_URL}/video/credit`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (res.status === 200) {
          setCredit(res.data.credit);
        }
      } catch (error) {
        console.error("Error fetching credit:", error);
      }
    };

    fetchCredit();
  }, []);



  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-text-navbar2">Cre8AI</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {user ? (
            <>
              <div className="token-balance-navbar3">
                <span className="token-amount">{credit || 0}</span>
                <span className="token-icon">🪙</span>
                <button className="add-tokens-btn-navbar" onClick={handleBuyTokens}>
                  <Plus size={16} />
                </button>
              </div>
              <div className="avatar-container-navbar3" ref={dropdownRef}>
                <button className="avatar-button-navbar3" onClick={toggleDropdown}>
                  <div className="avatar-e-navbar3">{getInitial()}</div>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu-home4">

                    <Link to='/profile' className="dropdown-item-home4">
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link to='/saved' className="dropdown-item-home4">
                      <FileVideo size={16}/>
                      <span>Saved</span>
                    </Link>
                    <button className="dropdown-item-home4" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={handleLogin}>Log In</button>
              <button className="signup-btn" onClick={handleSignup}>Sign Up</button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="mobile-nav" ref={menuRef}>
          <button className="avatar-button-navbar3 mobile-avatar" onClick={toggleDropdown}>
<div className="avatar-e-navbar3">user ? {getInitial()}</div>
          </button>
          <button className="mobile-menu-button" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <div className="mobile-token-section">
                <div className="token-balance-navbar3">
                  <span className="token-amount">{credit || 0}</span>
                  <span className="token-icon">🪙</span>
                  <button className="add-tokens-btn-navbar" onClick={handleBuyTokens}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="mobile-menu-items">
                <Link to='/' className="menu-item-navbar-s">
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                <Link to='/create' className="menu-item-navbar-s">
                  <Wand2 size={20} />
                  <span>Create</span>
                </Link>
                <Link to='/profile' className="menu-item-navbar-s">
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <button className="menu-item-navbar-s" onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <button className="login-btn" onClick={handleLogin}>Log In</button>
              <button className="signup-btn" onClick={handleSignup}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
