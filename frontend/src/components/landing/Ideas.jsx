import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import '../styles/Ideas.css';

// Sample data - replace with real data from your API
const ideasData = [
  {
    id: 1,
    title: 'Tech Sector Growth',
    ticker: 'NASDAQ: QQQ',
    type: 'Long Position',
    description: 'Bullish outlook on tech sector with strong earnings potential',
    risk: 'Medium',
    target: '$450.00',
    current: '$412.35',
    change: '+2.4%',
    timeframe: '3-6 months',
    chartData: [10, 15, 12, 25, 30, 28, 35, 40, 38, 45],
  },
  {
    id: 2,
    title: 'Renewable Energy',
    ticker: 'ICLN',
    type: 'Swing Trade',
    description: 'Clean energy sector showing strong momentum',
    risk: 'High',
    target: '$28.50',
    current: '$24.75',
    change: '+5.2%',
    timeframe: '1-3 months',
    chartData: [20, 18, 22, 25, 23, 28, 26, 24, 27, 25],
  },
  {
    id: 3,
    title: 'Gold Hedge',
    ticker: 'GLD',
    type: 'Hedge Position',
    description: 'Inflation hedge with gold exposure',
    risk: 'Low',
    target: '$195.00',
    current: '$182.40',
    change: '-0.8%',
    timeframe: '6-12 months',
    chartData: [180, 182, 181, 185, 184, 183, 182, 183, 181, 182],
  },
];

const Ideas = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isChartLoaded, setIsChartLoaded] = useState(false);

  useEffect(() => {
    // Load Chart.js dynamically
    const loadChart = async () => {
      try {
        // Dynamically import Chart.js
        await import('chart.js/auto');
        setIsChartLoaded(true);
      } catch (error) {
        console.error('Error loading charts:', error);
      }
    };

    loadChart();
  }, []);

  useEffect(() => {
    if (isChartLoaded) {
      // Initialize charts when component mounts and chart is loaded
      initializeCharts();
    }
  }, [isChartLoaded]);

  const initializeCharts = () => {
    // This function will be implemented to initialize charts
    // using the dynamically loaded Chart.js
    console.log('Charts initialized');
  };

  const filteredIdeas = activeTab === 'all' 
    ? ideasData 
    : ideasData.filter(idea => idea.type.toLowerCase().includes(activeTab));

  return (
    <section id="ideas" className="ideas-section section-pad">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Investment Ideas</h2>
          <div className="section-divider"></div>
          <p className="section-subtitle">Curated market insights and trade ideas</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Ideas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'long' ? 'active' : ''}`}
            onClick={() => setActiveTab('long')}
          >
            Long Positions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'swing' ? 'active' : ''}`}
            onClick={() => setActiveTab('swing')}
          >
            Swing Trades
          </button>
          <button 
            className={`tab-btn ${activeTab === 'hedge' ? 'active' : ''}`}
            onClick={() => setActiveTab('hedge')}
          >
            Hedge Positions
          </button>
        </div>

        {/* Ideas Grid */}
        <div className="ideas-grid">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="idea-card glass">
              <div className="idea-header">
                <div className="idea-title">
                  <h3>{idea.title}</h3>
                  <span className="ticker">{idea.ticker}</span>
                </div>
                <span className={`idea-type ${idea.type.toLowerCase().includes('long') ? 'long' : 
                  idea.type.toLowerCase().includes('swing') ? 'swing' : 'hedge'}`}>
                  {idea.type}
                </span>
              </div>
              
              <div className="idea-chart">
                <div className="chart-placeholder">
                  {/* Chart will be rendered here */}
                  <div className="mock-chart">
                    {idea.chartData.map((value, index) => (
                      <div 
                        key={index} 
                        className="chart-bar" 
                        style={{ height: `${value}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="idea-details">
                <p className="idea-description">{idea.description}</p>
                
                <div className="idea-stats">
                  <div className="stat">
                    <span className="stat-label">Risk</span>
                    <span className={`stat-value ${idea.risk.toLowerCase()}`}>
                      {idea.risk}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">{idea.target}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Current</span>
                    <span className="stat-value">{idea.current}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Change</span>
                    <span className={`stat-value ${
                      idea.change.startsWith('+') ? 'positive' : 'negative'
                    }`}>
                      {idea.change}
                    </span>
                  </div>
                </div>
                
                <div className="idea-timeframe">
                  <span className="timeframe-label">Timeframe:</span>
                  <span className="timeframe-value">{idea.timeframe}</span>
                </div>
              </div>
              
              <div className="idea-actions">
                <button className="btn btn-outline">View Analysis</button>
                <button className="btn btn-primary">Track Trade</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="view-all-container">
          <Link to="#" className="view-all-link">
            View All Ideas <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Ideas;
