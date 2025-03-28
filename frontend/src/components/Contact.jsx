import React from "react";
import "../styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contact Me</h1>
      <div className="contact-content">
        <p><strong>Email:</strong> omawchar07@gmail.com</p>
        <p><strong>Phone:</strong> 9890712303</p>
        <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer">linkedin.com/in/your-linkedin</a></p>
        <p>Feel free to reach out for collaboration, opportunities, or just to say hi!</p>
      </div>
    </div>
  );
};

export default Contact;