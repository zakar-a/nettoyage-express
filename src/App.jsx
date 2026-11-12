import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import PatronDashboard from './pages/PatronDashboard';
import EmployeDashboard from './pages/EmployeDashboard';
import AdminSettings from './pages/AdminSettings';
import InstallPwaBanner from './components/InstallPwaBanner';
import { LayoutDashboard, Car, LogOut, Settings, X, BellRing, Building2 } from 'lucide-react';

const AppContent = () => {
  const { currentUser, logout, dailyRecapModal, setDailyRecapModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (currentUser) {
      setActiveTab(currentUser.role === 'patron' ? 'dashboard' : 'terrain');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="container">
      {/* Official Print Header (Only visible when printing PDF Invoice / État des lieux) */}
      <div
        className="print-only"
        style={{
          display: 'none',
          borderBottom: '2px solid #0284c7',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#0284c7', textTransform: 'uppercase' }}>
              NETTOYAGE EXPRESS — Centre Esthétique Automobile
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#334155' }}>
              6, Rue Antoine de Saint Exupéry — 35235 Thorigné-Fouillard • Tél : 06.68.77.46.32 • nettoyageexpress35@gmail.com
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#334155' }}>
            <div><b>État des lieux / Relevé de Prestations</b></div>
            <div>Édité le {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* App Header */}
      <InstallPwaBanner />
      <header className="flex-between" style={{ marginBottom: '1.1rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <img
            src="/car-logo.svg"
            alt="Nettoyage Express"
            style={{ height: '40px', width: '40px', borderRadius: '10px', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                background: 'linear-gradient(135deg, #38bdf8, #ffffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {activeTab === 'dashboard'
                ? 'Nettoyage Express • Direction'
                : activeTab === 'terrain'
                ? 'Espace Terrain & Chantier'
                : 'Paramétrage Société'}
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.74rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentUser.name} • {currentUser.role === 'patron' ? 'Gérant (Thorigné & Rennes)' : currentUser.specialty || 'Salarié'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            background: 'var(--surface-color)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-secondary)',
            padding: '10px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="animate-in">
        {activeTab === 'dashboard' && currentUser.role === 'patron' && <PatronDashboard />}
        {activeTab === 'terrain' && <EmployeDashboard />}
        {activeTab === 'admin' && currentUser.role === 'patron' && <AdminSettings />}
      </main>

      {/* Daily Recap Push Modal for Patron */}
      {dailyRecapModal && currentUser.role === 'patron' && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(12px)',
            zIndex: 3500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="glass-card animate-in"
            style={{
              width: '100%',
              maxWidth: '410px',
              padding: '1.4rem',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setDailyRecapModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'rgba(14, 165, 233, 0.16)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <BellRing size={22} color="var(--accent-cyan)" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Bilan Fin de Journée ({dailyRecapModal.time})
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Activité par Pôle — Nettoyage Express</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.1rem' }}>
              {dailyRecapModal.siteBreakdown.map(site => (
                <div
                  key={site.id}
                  className="flex-between"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{site.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {site.count} véhicule{site.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                    {site.revenue.toFixed(2)}€ HT
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex-between"
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(16, 185, 129, 0.12))',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                marginBottom: '1.1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Journée HT
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {dailyRecapModal.totalCount} véhicule{dailyRecapModal.totalCount > 1 ? 's' : ''} traités
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                {dailyRecapModal.totalRevenue.toFixed(2)}€
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setDailyRecapModal(null)}
              style={{ width: '100%', padding: '12px' }}
            >
              Fermer le bilan
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {currentUser.role === 'patron' && (
          <button
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={22} />
            <span>Pilotage & Factures</span>
          </button>
        )}
        <button
          type="button"
          className={`nav-item ${activeTab === 'terrain' ? 'active' : ''}`}
          onClick={() => setActiveTab('terrain')}
        >
          <Car size={22} />
          <span>Terrain (Saisie)</span>
        </button>
        {currentUser.role === 'patron' && (
          <button
            type="button"
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={22} />
            <span>Paramètres</span>
          </button>
        )}
      </nav>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

