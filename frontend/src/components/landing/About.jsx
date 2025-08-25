import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <section id="about" className="about-section section-pad">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">About Me</h2>
          <div className="section-divider"></div>
        </div>
        
        <div className="about-content">
          <div className="about-image">
            <div className="glass">
              <img 
                src="/images/profile.jpg" 
                alt="Profile" 
                className="profile-image"
              />
            </div>
          </div>
          
          <div className="about-text">
            <h3>Market Research Analyst</h3>
            <p className="about-description">
              I'm a market research analyst focused on building systematic, data-driven trade ideas across indices and liquid equities. 
              My approach blends market internals, option data, and price structure to craft asymmetric opportunities.
            </p>
            
            <div className="about-details">
              <div className="detail-item">
                <h4>Tools & Technologies</h4>
                <p>TradingView, Python, Node.js, Postgres, MongoDB, GSAP</p>
              </div>
              
              <div className="detail-item">
                <h4>Trading Style</h4>
                <p>Swing-to-position, risk-first, evidence-led</p>
              </div>
            </div>
            
            <blockquote className="quote">
              "Edges come from preparation. Execution turns them into outcomes."
            </blockquote>
            
            <div className="cta-buttons">
              <a href="#contact" className="btn btn-cta">
                Contact Me
              </a>
              <a href="#" className="btn btn-ghost">
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;