import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, User, Lock, AlertCircle, MapPin, Phone, Shield, Car, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login, users } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
    }, 350);
  };

  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    login(user.username, user.password);
  };

  return (
    <div
      className="login-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '430px', padding: '1.75rem' }}
      >
        {/* Business Card Banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.25)',
              marginBottom: '1rem'
            }}
          >
            <img
              src="/nettoyage-express-card.jpg"
              alt="Nettoyage Express - Centre esthétique automobile"
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            />
          </div>

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #38bdf8, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Nettoyage Express
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Gestion Lavage Atelier, Concessionnaire & Convoyage
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              fontSize: '0.72rem',
              color: 'var(--accent-orange)',
              marginTop: '0.45rem',
              fontWeight: 600
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> Thorigné-Fouillard & Rennes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> 06.68.77.46.32
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
                fontWeight: 700
              }}
            >
              IDENTIFIANT
            </label>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 0.9rem' }}>
              <User size={18} color="var(--accent-cyan)" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Ex: patron, karim, yassine..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.85rem',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
                fontWeight: 700
              }}
            >
              MOT DE PASSE
            </label>
            <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0 0.9rem' }}>
              <Lock size={18} color="var(--accent-cyan)" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '0.85rem',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
                required
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(251, 113, 133, 0.12)',
                border: '1px solid rgba(251, 113, 133, 0.3)',
                color: 'var(--accent-rose)',
                padding: '0.75rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Connexion...' : 'Accéder à mon espace'}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div
          style={{
            marginTop: '1.4rem',
            paddingTop: '1.1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '0.65rem',
              textAlign: 'center',
              fontWeight: 600
            }}
          >
            Connexion Rapide (1 clic)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="glass"
                style={{
                  padding: '8px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  color: 'white',
                  border:
                    u.role === 'patron'
                      ? '1px solid rgba(251, 191, 36, 0.35)'
                      : '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                {u.role === 'patron' ? (
                  <Shield size={16} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                ) : u.specialty?.toLowerCase().includes('camion') ? (
                  <Truck size={16} color="var(--accent-orange)" style={{ flexShrink: 0 }} />
                ) : (
                  <Car size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.role === 'patron' ? 'Patron / Admin' : u.specialty || 'Salarié'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

