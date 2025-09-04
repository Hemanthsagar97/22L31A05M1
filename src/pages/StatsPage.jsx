import React, { useEffect, useState } from 'react';

import './StatsPage.css';

const StatsPage = () => {
    const [urls, setUrls] = useState([]);

    useEffect(() => {
        loadUrls();
    }, []);

    const loadUrls = () => {
        const savedUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
        setUrls(savedUrls);
    };

    const handleClick = (shortcode, originalUrl) => {
        
        // Add click data
        const updatedUrls = urls.map(url => {
            if (url.shortcode === shortcode) {
                const clickData = {
                    timestamp: new Date(),
                    source: window.location.href,
                    location: 'Local' // In a real app, we would get this from an IP geolocation service
                };
                return {
                    ...url,
                    clicks: [...url.clicks, clickData]
                };
            }
            return url;
        });

        localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
        setUrls(updatedUrls);

        // Redirect to original URL
        window.location.href = originalUrl;
    };

    return (
        <div className="stats-page">
            <h1>URL Statistics</h1>
            
            <div className="stats-list">
                {urls.map((url, index) => (
                    <div key={index} className="stats-item">
                        <div className="stats-header">
                            <h3>Shortened URL: 
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleClick(url.shortcode, url.originalUrl);
                                    }}
                                >
                                    {url.shortUrl}
                                </a>
                            </h3>
                        </div>
                        
                        <div className="stats-details">
                            <p><strong>Original URL:</strong> {url.originalUrl}</p>
                            <p><strong>Created:</strong> {new Date(url.createdAt).toLocaleString()}</p>
                            <p><strong>Expires:</strong> {new Date(url.expiresAt).toLocaleString()}</p>
                            <p><strong>Total Clicks:</strong> {url.clicks.length}</p>
                        </div>

                        {url.clicks.length > 0 && (
                            <div className="click-details">
                                <h4>Click History</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Source</th>
                                            <th>Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {url.clicks.map((click, clickIndex) => (
                                            <tr key={clickIndex}>
                                                <td>{new Date(click.timestamp).toLocaleString()}</td>
                                                <td>{click.source}</td>
                                                <td>{click.location}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
                
                {urls.length === 0 && (
                    <p className="no-data">No shortened URLs found.</p>
                )}
            </div>
        </div>
    );
};

export default StatsPage;
