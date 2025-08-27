import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './shared/Header';
import Footer from './shared/Footer';
import { marketAPI } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState({
    nifty: { value: '---', change: '0.00' },
    sensex: { value: '---', change: '0.00' },
    bankNifty: { value: '---', change: '0.00' },
    loading: true,
    error: null
  });

  // Fetch market overview data
  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        const data = await marketAPI.getMarketOverview();
        setMarketData({
          nifty: data.nifty || { value: '19,425.35', change: '+0.75' },
          sensex: data.sensex || { value: '64,112.65', change: '+0.82' },
          bankNifty: data.bankNifty || { value: '43,125.80', change: '-0.15' },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching market overview:', error);
        setMarketData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load market data. Using sample data.'
        }));
      }
    };

    fetchMarketOverview();
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container-fluid page-body-wrapper" style={{ backgroundColor: '#0e0e0e' }}>
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12">
                <div className="bg-color border-radius-10">
                  <div className="swing-heading">Sharada Dashboard</div>
                </div>
              </div>
            </div>

            {/* Market Data Overview */}
            <div className="bg-color p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3">
                  <h3 className="text-xl font-semibold text-white mb-2">NIFTY 50</h3>
                  {marketData.loading ? (
                    <p className="text-gray-400 text-2xl font-bold">Loading...</p>
                  ) : (
                    <p className={`${parseFloat(marketData.nifty.change) >= 0 ? 'text-green-400' : 'text-red-400'} text-2xl font-bold`}>
                      {marketData.nifty.value} <span className="text-sm">{marketData.nifty.change}%</span>
                    </p>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xl font-semibold text-white mb-2">SENSEX</h3>
                  {marketData.loading ? (
                    <p className="text-gray-400 text-2xl font-bold">Loading...</p>
                  ) : (
                    <p className={`${parseFloat(marketData.sensex.change) >= 0 ? 'text-green-400' : 'text-red-400'} text-2xl font-bold`}>
                      {marketData.sensex.value} <span className="text-sm">{marketData.sensex.change}%</span>
                    </p>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xl font-semibold text-white mb-2">BANK NIFTY</h3>
                  {marketData.loading ? (
                    <p className="text-gray-400 text-2xl font-bold">Loading...</p>
                  ) : (
                    <p className={`${parseFloat(marketData.bankNifty.change) >= 0 ? 'text-green-400' : 'text-red-400'} text-2xl font-bold`}>
                      {marketData.bankNifty.value} <span className="text-sm">{marketData.bankNifty.change}%</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Cards - Row 1 */}
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => handleCardClick('/market_depth')}>
                <h4>
                  <img src="/static/img/market_depth.png" alt="Market Depth" />
                  Market Depth
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/pro_setup')}>
                <h4>
                  <img src="/static/img/pro_setup.png" alt="Pro Setups" />
                  Pro Setups
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/sectorial_flow')}>
                <h4>
                  <img src="/static/img/sectorial_flow.png" alt="Sectorial Flow" />
                  Sectorial Flow
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/swing_center')}>
                <h4>
                  <img src="/static/img/swing_center.png" alt="Swing Center" />
                  Swing Center
                </h4>
              </div>
            </div>

            {/* Dashboard Cards - Row 2 */}
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => handleCardClick('/index_analysis')}>
                <h4>
                  <img src="/static/img/index_analysis.png" alt="Index Analysis" />
                  Index Analysis
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/moneyflux')}>
                <h4>
                  <img src="/static/img/moneyflux.png" alt="Money-Flux" />
                  Money-Flux
                </h4>
              </div>
            </div>

            {/* Dashboard Cards - Row 3 */}
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => handleCardClick('/scanners')}>
                <h4>
                  <img src="/static/img/scanner.png" alt="Scanners" />
                  Scanners
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/fno')}>
                <h4>
                  <img src="/static/img/service1.png" alt="FNO" />
                  FNO
                </h4>
              </div>
            </div>

            {/* Dashboard Cards - Row 4 */}
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => handleCardClick('/trading_journal')}>
                <h4>
                  <img src="/static/img/trading_journal.png" alt="Trading Journal" />
                  Trading Journal
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/watchlist')}>
                <h4>
                  <img src="/static/img/service4.png" alt="Watchlist" />
                  Watchlist
                </h4>
              </div>
            </div>

            {/* Dashboard Cards - Row 5 */}
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => handleCardClick('/fii_dii_data')}>
                <h4>
                  <img src="/static/img/fii_dii_data.png" alt="FII DII" />
                  FII DII
                </h4>
              </div>
              <div className="dashboard-card" onClick={() => handleCardClick('/ollama_assistant')}>
                <h4>
                  <img src="/static/img/service3.png" alt="Ollama Assistant" />
                  Ollama Assistant
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;