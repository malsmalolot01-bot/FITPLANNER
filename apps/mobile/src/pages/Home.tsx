import { IonContent, IonPage } from '@ionic/react';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { arrowUpOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import './Home.css';

const Home: React.FC = () => {
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToId = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    contentRef.current?.scrollToTop(400);
  };

  const handleScroll = (e: CustomEvent) => {
    setShowBackToTop(e.detail.scrollTop > 400);
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        scrollY={true}
        ref={contentRef}
        scrollEvents={true}
        onIonScroll={handleScroll}
      >
        <div className="landing">

          <nav className="nav">
            <div className="wrap">
              <div className="brand">
                <div className="brand-mark">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12H2M22 12h-2M6 7v10M18 7v10M6 12h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="brand-name">Fit<span>Planner</span></div>
              </div>
              <ul className="nav-links">
                <li><a href="#about" onClick={scrollToId('about')}>About</a></li>
                <li><a href="#training" onClick={scrollToId('training')}>Training</a></li>
                <li><a href="#nutrition" onClick={scrollToId('nutrition')}>Nutrition</a></li>
                <li><a href="#progress" onClick={scrollToId('progress')}>Progress</a></li>
              </ul>
              <div className="nav-cta">
                <Link to="/login" className="link-muted">Log in</Link>
                <Link to="/register" className="btn btn-primary">Get started</Link>
              </div>
            </div>
          </nav>

          <header className="hero">
            <div className="wrap">
              <div className="hero-copy">
                <div className="eyebrow"><span className="dot"></span> BMI-based routines for gym &amp; home</div>
                <h1>Train with a plan. <em>Not just a workout.</em></h1>
                <p className="hero-sub">FitPlanner calculates your BMI, builds a routine for the gym or home, and suggests a meal plan matched to your goal — fat loss, muscle gain, or maintenance.</p>
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary">Start your plan</Link>
                  <a href="#features" onClick={scrollToId('features')} className="btn btn-ghost">See how it works</a>
                </div>
              </div>

              <div className="hero-visual">
                <div className="visual-plate">
                  <div className="visual-bars">
                    <i style={{ height: '38%' }}></i>
                    <i style={{ height: '58%' }}></i>
                    <i style={{ height: '44%' }}></i>
                    <i className="active" style={{ height: '82%' }}></i>
                    <i style={{ height: '52%' }}></i>
                    <i style={{ height: '68%' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="about" id="about">
            <div className="wrap">
              <div className="about-intro">
                <h2>About FitPlanner.</h2>
                <p>A personal training system that starts with your BMI. No generic templates — just a routine, a meal plan, and a dashboard built around where you're starting from.</p>
              </div>

              <div className="about-points">
                <div className="about-point">
                  <div className="about-point-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18M7 15l4-5 3 3 5-7" stroke="#FF5E00" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div className="about-point-body">
                    <h4>Starts with your BMI</h4>
                    <p>Every routine and protocol is matched to your BMI category and your goal — fat loss, muscle gain, or maintenance.</p>
                  </div>
                </div>
                <div className="about-point">
                  <div className="about-point-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" stroke="#FF5E00" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div className="about-point-body">
                    <h4>Train anywhere</h4>
                    <p>Switch between gym and home routines any time, each broken down by target muscles, sets, and reps.</p>
                  </div>
                </div>
                <div className="about-point">
                  <div className="about-point-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 3c1.5 2 2 3.5 2 5a2 2 0 1 1-4 0c0-1.5.5-3 2-5zM7 13a5 5 0 0 0 10 0c0-2-1-3-2-4-1 1.5-1.5 2-3 2s-2-.5-3-2c-1 1-2 2-2 4z" stroke="#FF5E00" strokeWidth={1.8} strokeLinejoin="round" /></svg>
                  </div>
                  <div className="about-point-body">
                    <h4>Meals that match</h4>
                    <p>Meal suggestions line up with your training, so nutrition isn't a separate guessing game.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="features" id="features">
            <div className="wrap">
              <div className="features-head">
                <h2>System Over Spreadsheets.</h2>
                <p>No guesswork. Just a routine and meal plan built around your BMI.</p>
              </div>

              <div className="feature-grid">
                <div className="feature-card" id="training">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" stroke="#FF5E00" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <h3>Gym &amp; home workouts</h3>
                  <p>Switch between gym and home routines, each listing target muscles, sets, and reps.</p>
                </div>
                <div className="feature-card" id="progress">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18M7 15l4-5 3 3 5-7" stroke="#FF5E00" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <h3>BMI &amp; AI suggestions</h3>
                  <p>Get your BMI calculated instantly, with a workout protocol matched to fat loss, muscle gain, or maintenance.</p>
                </div>
                <div className="feature-card" id="nutrition">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 3c1.5 2 2 3.5 2 5a2 2 0 1 1-4 0c0-1.5.5-3 2-5zM7 13a5 5 0 0 0 10 0c0-2-1-3-2-4-1 1.5-1.5 2-3 2s-2-.5-3-2c-1 1-2 2-2 4z" stroke="#FF5E00" strokeWidth={1.8} strokeLinejoin="round" /></svg>
                  </div>
                  <h3>Meal plan</h3>
                  <p>Get meal suggestions that line up with your fitness goal, right alongside your workouts.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 21C7 17 3 13.5 3 9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 9 1.5C21 13.5 17 17 12 21z" stroke="#FF5E00" strokeWidth={1.8} strokeLinejoin="round" /></svg>
                  </div>
                  <h3>One dashboard</h3>
                  <p>See today's plan and jump straight into your next workout or meal update from a single screen.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="cta" id="cta">
            <div className="wrap">
              <h2>Your first plan is ready in under two minutes.</h2>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary">Start your plan</Link>
                <a href="#" className="btn btn-ghost">Watch a walkthrough</a>
              </div>
            </div>
          </section>

          <footer className="landing-footer">
            <div className="wrap">
              <span className="footer-copy">© 2026 FitPlanner. All rights reserved.</span>
              <div className="footer-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </footer>

        </div>

        {showBackToTop && (
          <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
            <IonIcon icon={arrowUpOutline} />
          </button>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;