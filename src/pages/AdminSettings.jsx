import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Shield, Car, MapPin, Plus, X, Trash2, Edit2, Building2, Check, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSettings = () => {
  const {
    users,
    sites,
    services,
    addUser,
    updateUser,
    updateDailyAssignment,
    deleteUser,
    addSite,
    updateSite,
    deleteSite,
    addService,
    updateService,
    deleteService,
    updateServicePrice,
    getStats
  } = useAppContext();

  const statsToday = getStats('day');
  const [activeSubTab, setActiveSubTab] = useState('employees');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'employe',
    specialty: 'Lavage & Convoyage',
    assignedSites: [1, 2, 3],
    dailySiteId: 1,
    dailyMissionNote: ''
  });

  const [siteFormData, setSiteFormData] = useState({
    name: '',
    category: 'garage',
    location: '',
    defaultClient: ''
  });

  const [serviceFormData, setServiceFormData] = useState({
    id: '',
    name: '',
    category: 'garage',
    vehicleType: 'Voiture',
    color: 'garage',
    defaultPrice: 45,
    prices: {}
  });

  const handleToggleSiteAssignment = (siteId) => {
    const numId = Number(siteId);
    setEmployeeFormData(prev => {
      const current = (prev.assignedSites || []).map(Number);
      const exists = current.includes(numId);
      const next = exists ? current.filter(id => id !== numId) : [...current, numId];
      return {
        ...prev,
        assignedSites: next,
        dailySiteId: next.includes(Number(prev.dailySiteId)) ? prev.dailySiteId : (next[0] || 1)
      };
    });
  };

  const handleEditEmployee = (user) => {
    setEditingItem(user);
    const assigned = (user.assignedSites && user.assignedSites.length ? user.assignedSites : [1, 2, 3]).map(Number);
    setEmployeeFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      specialty: user.specialty || 'Polyvalent',
      assignedSites: assigned,
      dailySiteId: user.dailySiteId !== undefined ? Number(user.dailySiteId) : (assigned[0] || 1),
      dailyMissionNote: user.dailyMissionNote || ''
    });
    setShowEmployeeModal(true);
  };

  const handleEditSite = (site) => {
    setEditingItem(site);
    setSiteFormData({
      name: site.name,
      category: site.category || 'garage',
      location: site.location || '',
      defaultClient: site.defaultClient || ''
    });
    setShowSiteModal(true);
  };

  const handleEditService = (service) => {
    setEditingItem(service);
    const firstPrice = service.prices ? Object.values(service.prices)[0] : 45;
    setServiceFormData({
      ...service,
      defaultPrice: firstPrice || 45
    });
    setShowServiceModal(true);
  };

  const handleSubmitEmployee = (e) => {
    e.preventDefault();
    if (!employeeFormData.assignedSites || employeeFormData.assignedSites.length === 0) {
      alert("Veuillez affecter au moins un pôle d'activité / site à ce salarié.");
      return;
    }
    if (editingItem) {
      updateUser(editingItem.id, employeeFormData);
    } else {
      addUser(employeeFormData);
    }
    setShowEmployeeModal(false);
    setEditingItem(null);
  };

  const handleSubmitSite = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateSite(editingItem.id, siteFormData);
    } else {
      addSite(siteFormData);
    }
    setShowSiteModal(false);
    setEditingItem(null);
  };

  const handleSubmitService = (e) => {
    e.preventDefault();
    const colorMap = {
      garage: serviceFormData.vehicleType?.includes('Camion') ? 'camion' : 'garage',
      concession: 'concession',
      convoyage: 'convoyage'
    };
    const payload = {
      ...serviceFormData,
      color: colorMap[serviceFormData.category] || 'garage'
    };
    if (editingItem) {
      updateService(editingItem.id, payload);
    } else {
      addService(payload);
    }
    setShowServiceModal(false);
    setEditingItem(null);
  };

  return (
    <div className="admin-settings animate-in">
      {/* Sub-Tabs */}
      <div className="glass" style={{ marginBottom: '1.2rem', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
        {[
          { key: 'employees', label: 'Salariés & Affectations' },
          { key: 'sites', label: '3 Pôles / Sites' },
          { key: 'presta', label: 'Prestations' },
          { key: 'tarifs', label: 'Tarifs HT' }
        ].map(tab => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            style={{
              flex: 1,
              padding: '9px 6px',
              border: 'none',
              background: activeSubTab === tab.key ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: activeSubTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SALARIÉS & AFFECTATIONS */}
      {activeSubTab === 'employees' && (
        <>
          <div
            className="glass-card"
            style={{
              padding: '1.1rem',
              marginBottom: '1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Production Équipe (Aujourd'hui)
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {statsToday.totalRevenue.toFixed(2)}€ HT
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>{statsToday.count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Véhicules</div>
            </div>
          </div>

          <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Affectation & Équipe ({users.length})
            </h2>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditingItem(null);
                setEmployeeFormData({
                  name: '',
                  username: '',
                  password: '123',
                  role: 'employe',
                  specialty: 'Lavage & Convoyage',
                  assignedSites: sites.map(s => Number(s.id)),
                  dailySiteId: sites[0]?.id || 1,
                  dailyMissionNote: ''
                });
                setShowEmployeeModal(true);
              }}
              style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            >
              <Plus size={16} /> Ajouter Salarié
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map(user => {
              const userSiteIds = (user.assignedSites || [1, 2, 3]).map(Number);
              return (
                <div key={user.id} className="glass-card" style={{ padding: '1rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: user.role === 'patron' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(56, 189, 248, 0.16)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Shield size={20} color={user.role === 'patron' ? 'var(--accent-gold)' : 'var(--accent-cyan)'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          @{user.username} • {user.specialty || 'Polyvalent'} •{' '}
                          <b style={{ color: 'var(--accent-cyan)' }}>
                            CA Jour: {(statsToday.byUser[user.id] || 0).toFixed(2)}€
                          </b>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleEditEmployee(user)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                        title="Modifier salarié & affectations"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user.username !== 'patron' && (
                        <button
                          type="button"
                          onClick={() => deleteUser(user.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                          title="Supprimer salarié"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Authorized Sites Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '2px' }}>
                      Pôles autorisés :
                    </span>
                    {userSiteIds.map(sid => {
                      const sObj = sites.find(s => Number(s.id) === sid);
                      if (!sObj) return null;
                      return (
                        <span
                          key={sid}
                          style={{
                            fontSize: '0.68rem',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: 'var(--accent-cyan)',
                            fontWeight: 600
                          }}
                        >
                          {sObj.name}
                        </span>
                      );
                    })}
                  </div>

                  {/* Quick Daily Affectation Selector */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '0.65rem 0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fdba74', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <UserCheck size={14} /> Affectation du jour :
                      </span>
                      <select
                        value={user.dailySiteId ?? 1}
                        onChange={(e) => updateDailyAssignment(user.id, Number(e.target.value), user.dailyMissionNote)}
                        className="glass"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          color: 'white',
                          background: '#0f172a',
                          border: '1px solid rgba(249, 115, 22, 0.35)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {sites.map(s => (
                          <option key={s.id} value={s.id}>
                            📍 {s.name}
                          </option>
                        ))}
                        <option value={0}>⏸️ Repos / Non affecté</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={user.dailyMissionNote || ''}
                      onChange={(e) => updateDailyAssignment(user.id, user.dailySiteId ?? 1, e.target.value)}
                      placeholder="Consigne du jour (ex: Aller chercher 3 voitures au Super U puis lavage garage...)"
                      className="glass"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '0.76rem',
                        color: 'white',
                        border: 'none',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 2. PÔLES / SITES */}
      {activeSubTab === 'sites' && (
        <div>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem' }}>Pôles d'Activité & Sites Clients</h2>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditingItem(null);
                setSiteFormData({ name: '', category: 'garage', location: '', defaultClient: '' });
                setShowSiteModal(true);
              }}
              style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            >
              <Plus size={16} /> Ajouter Site
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sites.map(site => (
              <div key={site.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Building2 size={20} color="var(--accent-cyan)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{site.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {site.location} • Client par défaut: <b>{site.defaultClient}</b>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleEditSite(site)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSite(site.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRESTATIONS */}
      {activeSubTab === 'presta' && (
        <div>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem' }}>Catalogue des Prestations</h2>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditingItem(null);
                setServiceFormData({
                  id: '',
                  name: '',
                  category: 'garage',
                  vehicleType: 'Voiture',
                  color: 'garage',
                  defaultPrice: 50,
                  prices: {}
                });
                setShowServiceModal(true);
              }}
              style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            >
              <Plus size={16} /> Nouvelle Prestation
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map(service => (
              <div key={service.id} className="glass-card" style={{ padding: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className={`service-btn ${service.color}`} style={{ minHeight: '42px', width: '42px', height: '42px', padding: 0, borderRadius: '12px' }}>
                    <Car size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{service.name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                      Pôle: <b>{service.category.toUpperCase()}</b> • {service.vehicleType}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleEditService(service)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteService(service.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. GRILLE TARIFAIRE */}
      {activeSubTab === 'tarifs' && (
        <div>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Tarifs HT par Prestation (€)</h2>
          <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '0.85rem', textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
                    Prestation
                  </th>
                  <th style={{ padding: '0.85rem', textAlign: 'center', borderBottom: '1px solid var(--surface-border)' }}>
                    Tarif HT (€)
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => {
                  const firstSiteId = sites[0]?.id || 1;
                  const val = (service.prices && service.prices[firstSiteId]) || 0;
                  return (
                    <tr key={service.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>{service.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {service.category.toUpperCase()} • {service.vehicleType}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            className="glass"
                            style={{
                              width: '72px',
                              padding: '7px',
                              textAlign: 'center',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              color: 'var(--accent-cyan)',
                              fontWeight: 800,
                              borderRadius: '8px'
                            }}
                            value={val}
                            onChange={e => {
                              sites.forEach(s => updateServicePrice(service.id, s.id, e.target.value));
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>€ HT</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Modal with Multi-Site Assignment Checkboxes */}
      <AnimatePresence>
        {showEmployeeModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 2500,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '3rem 1rem 2rem 1rem',
              overflowY: 'auto'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '440px', position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setShowEmployeeModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
              <h3 style={{ marginBottom: '1.1rem' }}>{editingItem ? 'Modifier' : 'Ajouter'} un Salarié & Affectation</h3>
              <form onSubmit={handleSubmitEmployee}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                    Prénom / Nom Complet
                  </label>
                  <input
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={employeeFormData.name}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-kpi" style={{ marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                      Identifiant
                    </label>
                    <input
                      className="glass"
                      style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                      value={employeeFormData.username}
                      onChange={e => setEmployeeFormData({ ...employeeFormData, username: e.target.value.toLowerCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                      Mot de passe
                    </label>
                    <input
                      type="text"
                      className="glass"
                      style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                      value={employeeFormData.password}
                      onChange={e => setEmployeeFormData({ ...employeeFormData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                    Spécialité / Rôle
                  </label>
                  <input
                    className="glass"
                    placeholder="Ex: Lavage, Convoyeur Super U, Camions..."
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={employeeFormData.specialty}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, specialty: e.target.value })}
                  />
                </div>

                {/* Multi-Site Checkboxes (like Mazagan) */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Affectation aux Pôles d'Activité (Accès autorisés)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sites.map(site => {
                      const isChecked = (employeeFormData.assignedSites || []).map(Number).includes(Number(site.id));
                      return (
                        <div
                          key={site.id}
                          onClick={() => handleToggleSiteAssignment(site.id)}
                          className="glass"
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: isChecked ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.08)',
                            background: isChecked ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{site.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{site.location}</div>
                          </div>
                          {isChecked && <Check size={18} color="var(--accent-cyan)" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Assignment & Consigne */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#fdba74', display: 'block', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Affectation Principale du Jour
                  </label>
                  <select
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a', marginBottom: '8px' }}
                    value={employeeFormData.dailySiteId}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, dailySiteId: Number(e.target.value) })}
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        📍 {s.name}
                      </option>
                    ))}
                    <option value={0}>⏸️ Repos / Non affecté</option>
                  </select>
                  <input
                    type="text"
                    className="glass"
                    placeholder="Consigne / Mission particulière du jour..."
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)', fontSize: '0.82rem' }}
                    value={employeeFormData.dailyMissionNote}
                    onChange={e => setEmployeeFormData({ ...employeeFormData, dailyMissionNote: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {editingItem ? 'Mettre à jour le salarié' : 'Enregistrer le salarié'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Site Modal */}
      <AnimatePresence>
        {showSiteModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 2500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '420px', position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setShowSiteModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
              <h3 style={{ marginBottom: '1.2rem' }}>{editingItem ? 'Modifier' : 'Ajouter'} un Site / Pôle</h3>
              <form onSubmit={handleSubmitSite}>
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom du Site</label>
                  <input
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={siteFormData.name}
                    onChange={e => setSiteFormData({ ...siteFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Type d'activité</label>
                  <select
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a' }}
                    value={siteFormData.category}
                    onChange={e => setSiteFormData({ ...siteFormData, category: e.target.value })}
                  >
                    <option value="garage">Garage / Atelier (Thorigné)</option>
                    <option value="concession">Sur Place Concessionnaire</option>
                    <option value="convoyage">Convoyage & Gardiennage (Super U → Rennes)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Adresse / Lieu</label>
                  <input
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={siteFormData.location}
                    onChange={e => setSiteFormData({ ...siteFormData, location: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Client par défaut</label>
                  <input
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={siteFormData.defaultClient}
                    onChange={e => setSiteFormData({ ...siteFormData, defaultClient: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Enregistrer
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 2500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '420px', position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
              <h3 style={{ marginBottom: '1.2rem' }}>{editingItem ? 'Modifier' : 'Nouvelle'} Prestation</h3>
              <form onSubmit={handleSubmitService}>
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nom de la prestation</label>
                  <input
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={serviceFormData.name}
                    onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    placeholder="Ex: Lavage Intérieur/Extérieur, Convoyage..."
                    required
                  />
                </div>
                <div className="grid-kpi" style={{ marginBottom: '0.9rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Pôle d'activité</label>
                    <select
                      className="glass"
                      style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a' }}
                      value={serviceFormData.category}
                      onChange={e => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    >
                      <option value="garage">Garage Thorigné</option>
                      <option value="concession">Concessionnaire</option>
                      <option value="convoyage">Convoyage Super U</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Type véhicule</label>
                    <select
                      className="glass"
                      style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a' }}
                      value={serviceFormData.vehicleType}
                      onChange={e => setServiceFormData({ ...serviceFormData, vehicleType: e.target.value })}
                    >
                      <option value="Voiture">Voiture</option>
                      <option value="Camion / Utilitaire">Camion / Utilitaire</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tarif HT (€)</label>
                  <input
                    type="number"
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', border: '1px solid var(--surface-border)' }}
                    value={serviceFormData.defaultPrice}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      const updatedPrices = {};
                      sites.forEach(s => {
                        updatedPrices[s.id] = val;
                      });
                      setServiceFormData({ ...serviceFormData, defaultPrice: val, prices: updatedPrices });
                    }}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Enregistrer la prestation
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;
