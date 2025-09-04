import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import './ShortenPage.css';

const ShortenPage = () => {
    const [urls, setUrls] = useState([{ id: uuidv4(), longUrl: '', validityPeriod: '', shortcode: '' }]);
    const [results, setResults] = useState([]);
    const [errors, setErrors] = useState({});

    const validateUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateShortcode = (shortcode) => {
        return /^[a-zA-Z0-9-_]{4,12}$/.test(shortcode);
    };

    const validateForm = () => {
        const newErrors = {};
        const existingUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
        const existingShortcodes = new Set(existingUrls.map(url => url.shortcode));
        
        urls.forEach((url, index) => {
            // Validate URL
            if (!url.longUrl) {
                newErrors[`url-${index}`] = 'URL is required';
            } else if (!validateUrl(url.longUrl)) {
                newErrors[`url-${index}`] = 'Invalid URL format. Must be a valid http or https URL';
            }
            
            // Validate validity period
            if (url.validityPeriod) {
                const validity = parseInt(url.validityPeriod);
                if (isNaN(validity)) {
                    newErrors[`validity-${index}`] = 'Validity must be a number';
                } else if (validity <= 0) {
                    newErrors[`validity-${index}`] = 'Validity must be greater than 0';
                }
            }

            // Validate shortcode if provided
            if (url.shortcode) {
                if (!validateShortcode(url.shortcode)) {
                    newErrors[`shortcode-${index}`] = 'Shortcode must be 4-12 characters long and contain only letters, numbers, hyphens, and underscores';
                } else if (existingShortcodes.has(url.shortcode)) {
                    newErrors[`shortcode-${index}`] = 'This shortcode is already in use';
                }
            }
        });

        // Check for duplicate shortcodes within current form
        const shortcodes = urls
            .map(url => url.shortcode)
            .filter(code => code);
        const duplicateShortcodes = shortcodes.filter((code, index) => shortcodes.indexOf(code) !== index);
        
        if (duplicateShortcodes.length > 0) {
            duplicateShortcodes.forEach(code => {
                urls.forEach((url, index) => {
                    if (url.shortcode === code) {
                        newErrors[`shortcode-${index}`] = 'Duplicate shortcode in form';
                    }
                });
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const shortenedUrls = urls.map(url => {
            const shortcode = url.shortcode || generateShortcode();
            const validityPeriod = url.validityPeriod || 30; // Default 30 minutes
            const creationTime = new Date();
            const expiryTime = new Date(creationTime.getTime() + validityPeriod * 60000);

            return {
                originalUrl: url.longUrl,
                shortUrl: `http://localhost:3000/${shortcode}`,
                shortcode,
                createdAt: creationTime,
                expiresAt: expiryTime,
                clicks: [],
            };
        });

        // Store in localStorage
        const existingUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
        localStorage.setItem('shortenedUrls', JSON.stringify([...existingUrls, ...shortenedUrls]));

        setResults(shortenedUrls);
    };

    const addUrlField = () => {
        if (urls.length < 5) {
            setUrls([...urls, { id: uuidv4(), longUrl: '', validityPeriod: '', shortcode: '' }]);
        }
    };

    const removeUrlField = (id) => {
        if (urls.length > 1) {
            setUrls(urls.filter(url => url.id !== id));
        }
    };

    const generateShortcode = () => {
        const existingUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
        const existingShortcodes = new Set(existingUrls.map(url => url.shortcode));
        let shortcode;
        
        do {
            // Generate a random 6-character alphanumeric code
            shortcode = Math.random().toString(36).substring(2, 8);
        } while (existingShortcodes.has(shortcode));
        
        return shortcode;
    };

    const handleInputChange = (id, field, value) => {
        setUrls(urls.map(url => 
            url.id === id ? { ...url, [field]: value } : url
        ));
    };

    return (
        <div className="shorten-page">
            <h1>URL Shortener</h1>
            
            <form onSubmit={handleSubmit} className="url-form">
                {urls.map((url, index) => (
                    <div key={url.id} className="url-input-group">
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="Enter long URL"
                                value={url.longUrl}
                                onChange={(e) => handleInputChange(url.id, 'longUrl', e.target.value)}
                                className={errors[`url-${index}`] ? 'error' : ''}
                            />
                            <input
                                type="text"
                                placeholder="Validity (minutes)"
                                value={url.validityPeriod}
                                onChange={(e) => handleInputChange(url.id, 'validityPeriod', e.target.value)}
                                className={errors[`validity-${index}`] ? 'error' : ''}
                            />
                            <input
                                type="text"
                                placeholder="Custom shortcode (optional, 4-12 chars)"
                                value={url.shortcode}
                                onChange={(e) => handleInputChange(url.id, 'shortcode', e.target.value)}
                                className={errors[`shortcode-${index}`] ? 'error' : ''}
                            />
                            {urls.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeUrlField(url.id)}
                                    className="remove-button"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        {errors[`url-${index}`] && <span className="error-message">{errors[`url-${index}`]}</span>}
                        {errors[`validity-${index}`] && <span className="error-message">{errors[`validity-${index}`]}</span>}
                        {errors[`shortcode-${index}`] && <span className="error-message">{errors[`shortcode-${index}`]}</span>}
                    </div>
                ))}
                
                {urls.length < 5 && (
                    <button type="button" onClick={addUrlField} className="add-button">
                        Add Another URL
                    </button>
                )}
                
                <button type="submit" className="submit-button">Shorten URLs</button>
            </form>

            {results.length > 0 && (
                <div className="results-section">
                    <h2>Shortened URLs</h2>
                    <div className="results-list">
                        {results.map((result, index) => (
                            <div key={index} className="result-item">
                                <p><strong>Original URL:</strong> {result.originalUrl}</p>
                                <p><strong>Short URL:</strong> <a href={result.shortUrl}>{result.shortUrl}</a></p>
                                <p><strong>Expires:</strong> {result.expiresAt.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShortenPage;
