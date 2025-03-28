import React, { useState } from 'react';
import {
  Play,
  Edit2,
  Plus,
  FolderOpen,
  Settings,
  Bell,
  CreditCard,
  ChevronRight,
  BarChart3,
  Clock,
  Mic,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Travel Vlog AI has been generated successfully!' },
    { id: 2, type: 'warning', message: 'You have 10 tokens remaining.' },
    { id: 3, type: 'info', message: 'New AI voice models are available!' }
  ]);

  const recentProjects = [
    { id: 1, thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=120', title: 'Travel Vlog AI', platform: 'YouTube', duration: '2 min', status: 'done' },
    { id: 2, thumbnail: 'https://images.unsplash.com/photo-1682687220063-4742bd7c98d6?w=120', title: 'Product Review', platform: 'Instagram', duration: '1 min', status: 'processing' },
    { id: 3, thumbnail: 'https://images.unsplash.com/photo-1682687220198-88e9bdea9931?w=120', title: 'Tech Tutorial', platform: 'TikTok', duration: '45 sec', status: 'done' },
  ];

  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="animated-text">Hey Payton! Ready to create your next AI-powered video?</h1>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card primary">
            <Plus className="card-icon" />
            <h3>Start New Project</h3>
            <p>Create a new AI-powered video</p>
            <button className="action-button">
              Get Started <ChevronRight className="icon" />
            </button>
          </div>
          <div className="action-card">
            <FolderOpen className="card-icon" />
            <h3>Saved Projects</h3>
            <p>Access your video library</p>
          </div>
          <div className="action-card">
            <Settings className="card-icon" />
            <h3>AI Settings</h3>
            <p>Customize AI preferences</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h2>Analytics Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <BarChart3 className="stat-icon" />
              <div className="stat-info">
                <h4>Total Videos</h4>
                <p className="stat-value">120</p>
              </div>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon" />
              <div className="stat-info">
                <h4>Last Generated</h4>
                <p className="stat-value">3 hours ago</p>
              </div>
            </div>
            <div className="stat-card">
              <Mic className="stat-icon" />
              <div className="stat-info">
                <h4>Popular Voice</h4>
                <p className="stat-value">English - Male 2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="recent-projects">
          <h2>Recent Projects</h2>
          <div className="projects-table-wrapper">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Platform</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(project => (
                  <tr key={project.id}>
                    <td>
                      <img src={project.thumbnail} alt={project.title} className="project-thumbnail" />
                    </td>
                    <td>{project.title}</td>
                    <td>{project.platform}</td>
                    <td>{project.duration}</td>
                    <td>
                      <span className={`status-badge ${project.status}`}>
                        {project.status === 'done' ? '✅ Done' : '⏳ Processing'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="icon-button">
                        <Play className="icon" />
                      </button>
                      <button className="icon-button">
                        <Edit2 className="icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="notifications-section">
          <h2>Notifications</h2>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification.id} className={`notification-item ${notification.type}`}>
                <AlertCircle className="notification-icon" />
                <p>{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Token Balance Section */}
      <aside className="token-sidebar">
        <div className="token-balance">
          <h2>Token Balance</h2>
          <div className="balance-display">
            <span className="token-amount">50</span>
            <span className="token-symbol">🪙</span>
          </div>
          <div className="token-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '70%' }}></div>
            </div>
            <p>Used 70/100 tokens this month</p>
          </div>
        </div>

        <div className="token-packages">
          <h3>Buy More Tokens</h3>
          <div className="package-cards">
            <div className="package-card">
              <h4>Starter</h4>
              <div className="package-price">
                <span className="token-amount">100</span>
                <span className="token-symbol">🪙</span>
              </div>
              <p className="package-value">$5</p>
              <button className="buy-button">
                <CreditCard className="icon" /> Buy Now
              </button>
            </div>
            <div className="package-card featured">
              <h4>Popular</h4>
              <div className="package-price">
                <span className="token-amount">500</span>
                <span className="token-symbol">🪙</span>
              </div>
              <p className="package-value">$20</p>
              <button className="buy-button">
                <CreditCard className="icon" /> Buy Now
              </button>
            </div>
            <div className="package-card">
              <h4>Pro</h4>
              <div className="package-price">
                <span className="token-amount">1000</span>
                <span className="token-symbol">🪙</span>
              </div>
              <p className="package-value">$35</p>
              <button className="buy-button">
                <CreditCard className="icon" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;