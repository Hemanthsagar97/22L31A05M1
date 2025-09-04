import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ShortenPage from './pages/ShortenPage';
import StatsPage from './pages/StatsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <div className="nav-content">
            <h1 className="nav-title">URL Shortener</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Shorten URLs</Link>
              <Link to="/stats" className="nav-link">Statistics</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ShortenPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/:shortcode" element={<RedirectComponent />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Component to handle redirects from short URLs
const RedirectComponent = () => {
  const shortcode = window.location.pathname.slice(1);
  const urls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
  const urlData = urls.find(u => u.shortcode === shortcode);

  React.useEffect(() => {
    if (urlData) {
      // Check if URL has expired
      if (new Date(urlData.expiresAt) < new Date()) {
        alert('This URL has expired');
        window.location.href = '/';
        return;
      }

      // Add click data
      const clickData = {
        timestamp: new Date(),
        source: document.referrer || 'Direct',
        location: 'Local'
      };

      // Update click statistics
      const updatedUrls = urls.map(url => {
        if (url.shortcode === shortcode) {
          return {
            ...url,
            clicks: [...url.clicks, clickData]
          };
        }
        return url;
      });

      localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
      window.location.href = urlData.originalUrl;
    } else {
      // Handle invalid shortcode
      alert('Invalid or expired URL');
      window.location.href = '/';
    }
  }, []);

  return <div className="redirect-message">Redirecting...</div>;
};

export default App;
