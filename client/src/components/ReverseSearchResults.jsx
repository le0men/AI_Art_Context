import React from 'react';
import '../styling/ReverseSearchResults.css';

export default function ReverseSearchResults({ reverseSearch }) {
  if (!reverseSearch) return null;

  return (
    <div className="reverse-search-section">
      <div className="section-header">
        <h4 className="section-title">Reverse Image Search</h4>
        <span className={`status-badge ${reverseSearch.was_found ? 'found' : 'not-found'}`}>
          {reverseSearch.was_found ? '✓ Matches Found' : '✗ No Matches'}
        </span>
      </div>

      {reverseSearch.was_found && reverseSearch.matches && reverseSearch.matches.length > 0 && (
        <div className="matches-container">
          <p className="matches-count">
            Found {reverseSearch.matches.length} match{reverseSearch.matches.length !== 1 ? 'es' : ''}
          </p>

          <div className="matches-list">
            {reverseSearch.matches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-header">
                  <span className="match-number">#{index + 1}</span>
                  <a
                    href={match.earliest_backlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="domain-link"
                  >
                    {match.domain}
                  </a>
                </div>

                <div className="match-details">
                  <div className="detail-row">
                    <span className="detail-label">Image URL:</span>
                    <a
                      href={match.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-value link"
                    >
                      View Image ↗
                    </a>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Dimensions:</span>
                    <span className="detail-value">
                      {match.width} × {match.height} px
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">First Crawled:</span>
                    <span className="detail-value">
                      {new Date(match.earliest_crawl_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Source Page:</span>
                    <a
                      href={match.earliest_backlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-value link"
                    >
                      Visit Page ↗
                    </a>
                  </div>
                </div>

                {match.image_url && (
                  <div className="match-preview">
                    <img
                      src={match.image_url}
                      alt={`Match from ${match.domain}`}
                      className="preview-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {reverseSearch.was_found && (!reverseSearch.matches || reverseSearch.matches.length === 0) && (
        <p className="no-matches-message">Matches were found but details are not available.</p>
      )}
    </div>
  );
}