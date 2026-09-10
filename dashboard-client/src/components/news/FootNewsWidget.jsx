

import React, { useState, useEffect, useCallback } from 'react';
import { getFromApi } from '../../services/axiosService';

const SportsNewsWidget = ({ widget }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState('soccer');
  const [error, setError] = useState(null);

  const sports = [
    { value: 'soccer', label: 'Soccer', icon: '⚽' },
    { value: 'basketball', label: 'Basketball', icon: '🏀' },
    { value: 'tennis', label: 'Tennis', icon: '🎾' },
    { value: 'formula1', label: 'Formula 1', icon: '🏎️' },
    { value: 'nfl', label: 'NFL', icon: '🏈' },
    { value: 'baseball', label: 'Baseball', icon: '⚾' },
    { value: 'hockey', label: 'Hockey', icon: '🏒' },
    { value: 'cricket', label: 'Cricket', icon: '🏏' },
    { value: 'rugby', label: 'Rugby', icon: '🏉' },
    { value: 'golf', label: 'Golf', icon: '⛳' },
  ];

  const fetchNews = useCallback(async (sport) => {
  setLoading(true);
  setError(null);
  
  try {
    // provide sport like queryparam
    const [success, data] = await getFromApi(`widgets/${widget._id}/fetch?q=${sport}`);
    
    if (success && data?.success) {
      setArticles(data.data.articles || []);
    } else {
      setError('Cannot load news');
      setArticles([]);
    }
  } catch {
    setError('Cannot load news');
    setArticles([]);
  } finally {
    setLoading(false);
  }
  }, [widget._id]);

  useEffect(() => {
    fetchNews(selectedSport);
    const refreshMs = (widget.refreshRate || 300) * 1000;
    const interval = setInterval(() => fetchNews(selectedSport), refreshMs);
    return () => clearInterval(interval);
  }, [selectedSport, fetchNews, widget.refreshRate]);

  const handleSportChange = (e) => {
    setSelectedSport(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-purple-500/20 rounded-xl p-4 hover:border-pink-500/40 transition-all duration-300 shadow-lg hover:shadow-pink-500/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
            {widget.icon?.startsWith('http') ? (
              <img src={widget.icon} alt={widget.name} className="w-6 h-6 object-cover rounded" />
            ) : (
              <span className="text-lg">{widget.icon || '📰'}</span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">{widget.name}</h4>
            <p className="text-xs text-purple-300">{widget.description}</p>
          </div>
        </div>
      </div>

      {/* Sport Selector */}
      <div className="mb-3">
        <select
          value={selectedSport}
          onChange={handleSportChange}
          className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors cursor-pointer hover:bg-black/60"
        >
          {sports.map((sport) => (
            <option key={sport.value} value={sport.value} className="bg-indigo-950">
              {sport.icon} {sport.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="bg-black/30 rounded-lg border border-white/5 backdrop-blur-sm max-h-96 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center space-x-2 text-purple-300 p-8">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm italic">Loading news...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center space-x-2 text-pink-400 p-8">
            <p className="text-sm">{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-purple-300">
            <span className="text-5xl mb-3 block">📰</span>
            <p className="text-sm">No news available</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-500/20">
              <span className="text-xs text-purple-300 font-semibold uppercase tracking-wide">
                Latest {sports.find(s => s.value === selectedSport)?.icon} {selectedSport} News
              </span>
              <span className="text-xs text-purple-400">{articles.length} articles</span>
            </div>
            
            {articles.slice(0, 10).map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-lg p-3 hover:from-indigo-800/60 hover:to-purple-800/60 transition-all duration-300 border border-purple-500/10 hover:border-pink-500/30 group"
              >
                <div className="flex gap-3">
                  {article.urlToImage && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-black/40 border border-white/5">
                      <img
                        src={article.urlToImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-pink-300 transition-colors">
                      {article.title}
                    </h5>
                    
                    {article.description && (
                      <p className="text-xs text-purple-200 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-400 truncate max-w-[150px]">
                        {article.source?.name || 'Unknown'}
                      </span>
                      <span className="text-purple-500">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.6);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SportsNewsWidget;

