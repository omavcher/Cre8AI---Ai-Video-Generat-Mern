import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <div className="about-container">
      <h1>About Me</h1>
      <div className="about-content">
        <div className="about-profile-section">
          <img src="https://avatars.githubusercontent.com/u/153804283?v=4" alt="Om Avcher" className="about-profile-photo" />
          <h2>Om Avcher</h2>
          <p>omawchar07@gmail.com | 9890712303</p>
          <a href="https://www.linkedin.com/in/omawchar/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>

        <section className="about-section">
          <h3>About</h3>
          <p>MERN Full-Stack Developer with expertise in React.js, Node.js, Express.js, and MongoDB. Passionate about scalable web apps and AI-driven solutions.</p>
        </section>

        <section className="about-section">
          <h3>Projects</h3>
          <div className="about-project">
            <h4>Ai Hire Me</h4>
            <p>AI-powered job preparation platform with resume analysis, AI chat, and DSA practice.</p>
          </div>
          <div className="about-project">
            <h4>E-Commerce Platform</h4>
            <p>Full-stack store with Razorpay integration, dynamic product management, and secure payments.</p>
          </div>
        </section>

        <section className="about-section">
          <h3>Experience</h3>
          <p><strong>Prodigy InfoTech</strong> - Web Development Intern</p>
          <p>Worked on UI improvements, API integrations, and MongoDB management.</p>
        </section>
      </div>
    </div>
  );
};

export default About;
