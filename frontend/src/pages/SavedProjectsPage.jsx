import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Youtube, Instagram, X, Download, Trash2, Clock, Calendar,
  Copy, Sparkles, Coins, Plus, ChevronRight, ChevronLeft, Pause, Star
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import './SavedProjectsPage.css';
import axios from 'axios';
import { BASE_URL } from "../config/api";
import ExportDialog from '../components/ExportDialog';
import VideoPreviewDialog from '../components/VideoPreviewDialog.JSX';

const SavedProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');
  const [showSEOModal, setShowSEOModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hideRecentProject, setHideRecentProject] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [noProjectsFound, setNoProjectsFound] = useState(false);
  const modalRef = useRef(null);
  const projectsPerPage = 6;
  const [recentProjects, setRecentProjects] = useState([]);
  const [audioLengths, setAudioLengths] = useState({});
  const [credit, setCredit] = useState(0);
  const [copyMessage, setCopyMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [ExportDialogBox, setExportDaialogBox] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSEOModal(false);
      }
    };

    if (showSEOModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSEOModal]);

  const getAudioDuration = (audioUrl, projectId) => {
    if (!audioUrl) {
      setAudioLengths(prev => ({ ...prev, [projectId]: 'N/A' }));
      return;
    }

    const audio = new Audio(audioUrl);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}m ${seconds}s`;
      setAudioLengths(prev => ({ ...prev, [projectId]: formattedDuration }));
    });

    audio.addEventListener('error', (e) => {
      setAudioLengths(prev => ({ ...prev, [projectId]: 'N/A' }));
    });

    audio.load();
  };

  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
        setHideRecentProject(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

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

    const fetchSavedProjects = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      try {
        const res = await axios.get(`${BASE_URL}/video/saved-projects`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (res.status === 200) {
          const projects = res.data;
          setSavedProjects(projects);
          setNoProjectsFound(false);
          projects.forEach(project => {
            getAudioDuration(project.audioUrl, project._id);
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setNoProjectsFound(true);
          setSavedProjects([]);
        }
        console.error("Error fetching saved projects:", error);
      }
    };
    
    fetchSavedProjects();
    fetchCredit();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchRecentProjects = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user?.token) {
        console.error("User or token not found");
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/video/recent/${projectId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          }
        });
        
        if (mounted) {
          setRecentProjects(response.data);
          
          if (response.data.length > 0 && response.data[0].audioUrl) {
            getAudioDuration(response.data[0].audioUrl, response.data[0]._id);
          } else {
            setAudioLengths(prev => ({ ...prev, [response.data[0]?._id]: 'N/A' }));
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching recent projects:", error);
          if (response?.data[0]?._id) {
            setAudioLengths(prev => ({ ...prev, [response.data[0]._id]: 'N/A' }));
          }
        }
      }
    };

    fetchRecentProjects();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const getFeedbackMessage = () => {
    if (rating >= 5) return { text: "Thanks for the great feedback!", color: "bg-green-500" };
    if (rating >= 3) return { text: "We'll try to improve!", color: "bg-yellow-500" };
    return { text: "We're sorry! We'll work hard to improve.", color: "bg-red-500" };
  };

  const handleRating = async (value) => {
    setRating(value);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token || !recentProjects.length) {
        console.error("User, token, or recent project not found"); 
        return; 
      }
      
      const response = await axios.post(`${BASE_URL}/video/feedback`, {
        videoId: recentProjects[0]._id,
        rating: value
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.status === 200) {
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
          setHideRecentProject(true);
        }, 10000); 
      }
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleSEO = (project) => {
    setSelectedProject(project);
    setShowSEOModal(true);
  };

  const handleDelete = async (projectId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const response = await axios.delete(`${BASE_URL}/video/saved-projects/${projectId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.status === 200 || response.status === 204) {
        setSavedProjects(prev => prev.filter(project => project._id !== projectId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handlePreview = (project) => {
    setPreviewProject(project);
  };

  const validProjects = savedProjects.filter(project => audioLengths[project._id] && audioLengths[project._id] !== 'N/A');
  const totalPages = Math.ceil(validProjects.length / projectsPerPage);
  const currentProjects = validProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const SEOModal = ({ project }) => {
    const isYoutube = project.platform === 'youtube';

    const copyToClipboard = (text, type) => {
      navigator.clipboard.writeText(text);
      setCopyMessage(`Your ${type} is copied!`);
      setTimeout(() => setCopyMessage(null), 5000);
    };

    const downloadThumbnail = async () => {
      try {
        const response = await fetch(project.thumbnailUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.seo.title.replace(/[^a-zA-Z0-9]/g, '_')}_thumbnail.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading thumbnail:", error);
      }
    };

    return (
      <div className="seo-modal-overlay">
        <div className="seo-modal" ref={modalRef}>
          <button className="close-modal" onClick={() => setShowSEOModal(false)}>
            <X size={24} />
          </button>
          <h2>
            <Sparkles className="seo-icon" />
            AI SEO Optimization
          </h2>

          {copyMessage && (
            <div className="copy-feedback">
              {copyMessage}
            </div>
          )}

          <div className="thumbnail-preview">
            <div className="current-thumbnail">
              <h3>Current Thumbnail</h3>
              <img src={project.imageUrls[0]} alt="Current thumbnail" />
            </div>
            <div className="ai-thumbnail">
              <h3>AI-Generated Thumbnail</h3>
              <img src={project.thumbnailUrl} alt="AI-generated thumbnail" />
              <button className="use-thumbnail-btn" onClick={downloadThumbnail}>
                Use This Thumbnail
              </button>
            </div>
          </div>
          
          {isYoutube ? (
            <div className="youtube-suggestions">
              <div className="suggestion-section">
                <h3>Suggested Video Title</h3>
                <div className="copy-section">
                  <p>{project.seo.title}</p>
                  <button onClick={() => copyToClipboard(project.seo.title, 'title')}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="suggestion-section">
                <h3>AI-Generated Description</h3>
                <div className="copy-section">
                  <p>{project.seo.description}</p>
                  <button onClick={() => copyToClipboard(project.seo.description, 'description')}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="suggestion-section">
                <h3>Keyword Suggestions</h3>
                <div className="tags-grid">
                  {project.seo.keywords.map((keyword, index) => (
                    <div key={index} className="tag" onClick={() => copyToClipboard(keyword, 'keyword')}>
                      {keyword}
                      <Copy size={12} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="suggestion-section">
                <h3>Video Tags</h3>
                <div className="tags-grid">
                  {project.seo.hashtags.map((tag, index) => (
                    <div key={index} className="tag" onClick={() => copyToClipboard(tag, 'hashtag')}>
                      {tag}
                      <Copy size={12} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="instagram-suggestions">
              <div className="suggestion-section">
                <h3>Suggested Caption</h3>
                <div className="copy-section">
                  <p>{project.seo.description.split('.')[0] + '.'}</p>
                  <button onClick={() => copyToClipboard(project.seo.description.split('.')[0] + '.', 'caption')}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="suggestion-section">
                <h3>Suggested Hashtags</h3>
                <div className="copy-section">
                  <p>{project.seo.hashtags.join(' ')}</p>
                  <button onClick={() => copyToClipboard(project.seo.hashtags.join(' '), 'hashtags')}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="suggestion-section">
                <h3>Best Time to Post</h3>
                <p className="best-time">{project.seo.bestTimeToPostIndia}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="saved-projects-page">
      {/* Recent Project Section */}
      {recentProjects.length > 0 && !hideRecentProject && (
        <section className="recent-project-section">
          <div className="recent-project-card">
            <div className="recent-thumbnail">
              <img src={recentProjects[0].imageUrls[0]} alt={recentProjects[0].seo.title} />
              <div className="platform-badge">
                {recentProjects[0].platform.toLowerCase() === 'youtube' && <Youtube size={16} />}
                {recentProjects[0].platform.toLowerCase() === 'instagram' && <Instagram size={16} />}
                {recentProjects[0].platform.toLowerCase() === 'tiktok' && (
                  <span className="tiktok-icon">TT</span>
                )}
                {recentProjects[0].platform.toLowerCase() === 'facebook' && (
                  <span className="facebook-icon">F</span>
                )}
              </div>
            </div>
            <div className="recent-content">
              <h3>
                {recentProjects[0].seo?.title
                  ? recentProjects[0].seo.title.split(' ').slice(0, 5).join(' ') + '...'
                  : 'Untitled Project...'}
              </h3>
              <div className="meta-info">
                <span>
                  <Calendar size={14} />
                  {new Date(recentProjects[0].createdAt).toISOString().split('T')[0]}
                </span>
                <span>
                  <Clock size={14} />
                  {audioLengths[recentProjects[0]._id] || 'N/A'}
                </span>
              </div>
              {!showFeedback ? (
                <div className="rating-section">
                  <p>How would you rate this creation?</p>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className={`star-button ${rating >= star || recentProjects[0].rating >= star ? 'active' : ''}`}
                      >
                        <Star size={24} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`feedback-message ${getFeedbackMessage().color}`}>
                  <p>{getFeedbackMessage().text}</p>
                  <div className="progress-bar-container">
                    <div className="feedback-progress-bar" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section className="projects-section">
        <div className="section-header">
          <h2>Saved Projects</h2>
          <div className="tokens-info">
            <Coins className="token-icon" />
            <span>{credit} Tokens Left</span>
            <Link to='/buy-tokens' className="buy-tokens-btn">
              <Plus size={16} />
              Buy More Tokens
            </Link>
          </div>
        </div>

        {noProjectsFound ? (
          <div className="no-projects-container">
            <p className="no-projects-message">No saved projects found</p>
            <Link to="/create" className="create-project-btn">
              <Plus size={16} />
              Create a Value
            </Link>
          </div>
        ) : (
          <>
            <div className="projects-grid">
              {currentProjects.map((project) => (
                <div 
                  key={project._id} 
                  className={`project-card ${project.platform === 'instagram' ? 'instagram' : 'youtube'}`}
                >
                  <div className="thumbnail">
                    <img src={project.thumbnailUrl} alt={project.seo.title} />
                    <div className="platform-badge">
                      {project.platform === 'youtube' ? (
                        <Youtube size={16} />
                      ) : (
                        <Instagram size={16} />
                      )}
                    </div>
                  </div>
                  <div className="project-details">
                    <h3>{project.seo.title}</h3>
                    <p className="project-description">{project.seo.description}</p>
                    <div className="meta-info">
                      <span>
                        <Calendar size={14} />
                        {new Date(project.createdAt).toISOString().split('T')[0]}
                      </span>
                      <span>
                        <Clock size={14} />
                        {audioLengths[project._id] || 'N/A'}
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="preview-button"
                        onClick={() => handlePreview(project)}
                      >
                        <Play size={16} />
                      </button>
                      <button 
                        className="seo-button"
                        onClick={() => handleSEO(project)}
                      >
                        <Sparkles size={16} />
                        SEO
                      </button>
                      <button 
                        className="download-button"
                        onClick={() => setExportDaialogBox(true)}
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => setShowDeleteConfirm(project._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="page-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <p>Are you sure you want to delete this project permanently?</p>
            <div className="confirm-buttons">
              <button 
                className="confirm-btn bg-red-500 text-white"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Yes
              </button>
              <button 
                className="cancel-btn bg-gray-300 text-black"
                onClick={() => setShowDeleteConfirm(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showSEOModal && selectedProject && (
        <SEOModal project={selectedProject} />
      )}

      {previewProject && (
        <VideoPreviewDialog 
          project={previewProject}
          onClose={() => setPreviewProject(null)}
        />
      )}

      {ExportDialogBox && (
        <ExportDialog onClose={() => setExportDaialogBox(false)} />
      )}
    </div>
  );
};

export default SavedProjectsPage;