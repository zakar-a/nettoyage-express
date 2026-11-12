import React, { useState, useMemo } from 'react';
import { useAppContext, formatLicensePlate } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import {
  TrendingUp,
  Car,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Share2,
  Trash2,
  Bell,
  BellOff,
  BellRing,
  Navigation,
  Sparkles,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PatronDashboard = () => {
  const {
    sites,
    users,
    services,
    getStats,
    transactions,
    downloadCSV,
    cancelTransaction,
    completeIntervention,
    addIntervention,
    updateDailyAssignment,
    notifPermission,
    notifEnabled,
    setNotifEnabled,
    requestNotificationPermission,
    sendDailyRecapNotification
  } = useAppContext();

  const [selectedSite, setSelectedSite] = useState('all');
  const [timeframe, setTimeframe] = useState('day');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [clientFilter, setClientFilter] = useState('all');
  const [shareFeedback, setShareFeedback] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    employeId: 'u2',
    siteId: 3,
    serviceId: 'convoyage-superu-rennes',
    plateNumber: '',
    mileageStart: '',
    pickupLocation: 'Parc Super U Thorigné',
    dropoffLocation: 'Concessionnaire Rennes',
    clientName: 'Concessionnaire Rennes',
    notes: ''
  });
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleDispatchMission = (e) => {
    e.preventDefault();
    const cleanPlate = formatLicensePlate(dispatchForm.plateNumber);
    if (!cleanPlate) {
      alert("Veuillez indiquer l'immatriculation du véhicule.");
      return;
    }
    const targetSite = sites.find(s => Number(s.id) === Number(dispatchForm.siteId)) || sites[0];
    addIntervention({
      employeId: dispatchForm.employeId,
      siteId: targetSite.id,
      activityType: targetSite.category,
      serviceId: dispatchForm.serviceId,
      plateNumber: cleanPlate,
      mileageStart: dispatchForm.mileageStart,
      pickupLocation: dispatchForm.pickupLocation,
      dropoffLocation: dispatchForm.dropoffLocation,
      clientName: dispatchForm.clientName || targetSite.defaultClient,
      status: 'en_cours',
      notes: dispatchForm.notes
    });
    setShowDispatchModal(false);
    setDispatchForm(prev => ({ ...prev, plateNumber: '', mileageStart: '', notes: '' }));
  };

  const stats = useMemo(
    () => getStats(timeframe, selectedSite, timeframe === 'custom' ? customRange : null),
    [timeframe, selectedSite, customRange, transactions]
  );

  // Unique clients for invoice / état des lieux filtering
  const availableClients = useMemo(() => {
    const set = new Set();
    stats.activePositive.forEach(t => {
      if (t.clientName) set.add(t.clientName);
    });
    return Array.from(set);
  }, [stats]);

  // Filtered list for client billing statement (État des lieux par prestation)
  const billingStatement = useMemo(() => {
    const items =
      clientFilter === 'all'
        ? stats.activePositive
        : stats.activePositive.filter(t => t.clientName === clientFilter);

    const byType = {};
    items.forEach(t => {
      const key = t.serviceName || 'Prestation';
      if (!byType[key]) {
        byType[key] = {
          serviceName: key,
          activityType: t.activityType,
          count: 0,
          totalHT: 0,
          plates: []
        };
      }
      byType[key].count += 1;
      byType[key].totalHT = parseFloat((byType[key].totalHT + Number(t.amount)).toFixed(2));
      if (t.plateNumber) byType[key].plates.push(t.plateNumber);
    });

    const rows = Object.values(byType).sort((a, b) => b.totalHT - a.totalHT);
    const totalHT = parseFloat(rows.reduce((sum, r) => sum + r.totalHT, 0).toFixed(2));
    const tva = parseFloat((totalHT * 0.2).toFixed(2));
    const totalTTC = parseFloat((totalHT + tva).toFixed(2));

    return { items, rows, totalHT, tva, totalTTC };
  }, [stats, clientFilter]);

  const chartData = useMemo(() => {
    return Object.keys(stats.byService)
      .map(name => ({
        name,
        shortName: name.length > 12 ? name.slice(0, 11) + '…' : name,
        value: parseFloat((stats.byService[name] || 0).toFixed(2)),
        count: stats.byServiceCount[name] || 0
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const employeeChartData = useMemo(() => {
    const data = {};
    const counts = {};
    stats.filtered.forEach(t => {
      const name = t.employeName || 'Inconnu';
      data[name] = (data[name] || 0) + (Number(t.amount) || 0);
      const delta = t.amount > 0 ? 1 : t.amount < 0 ? -1 : 0;
      counts[name] = Math.max(0, (counts[name] || 0) + delta);
    });
    return Object.keys(data)
      .map(name => ({
        name,
        shortName: name.length > 12 ? name.slice(0, 11) + '…' : name,
        value: parseFloat(data[name].toFixed(2)),
        count: counts[name] || 0
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const handleShareStatement = async () => {
    const periodLabel =
      timeframe === 'day'
        ? `Aujourd'hui (${new Date().toLocaleDateString()})`
        : timeframe === 'week'
        ? '7 derniers jours'
        : timeframe === 'month'
        ? 'Mois en cours'
        : `Du ${customRange.start} au ${customRange.end}`;

    const lines = [
      `📋 ÉTAT DES LIEUX PRESTATIONS — NETTOYAGE EXPRESS`,
      `📍 6 Rue Antoine de Saint Exupéry, 35235 Thorigné-Fouillard`,
      `📅 Période : ${periodLabel}`,
      clientFilter !== 'all' ? `🏢 Client : ${clientFilter}` : `🏢 Tous les clients / sites`,
      `----------------------------------------`,
      ...billingStatement.rows.map(
        r => `• ${r.serviceName} : ${r.count} véh. = ${r.totalHT.toFixed(2)}€ HT (${r.plates.join(', ')})`
      ),
      `----------------------------------------`,
      `💰 TOTAL HT : ${billingStatement.totalHT.toFixed(2)}€`,
      `🧾 TVA (20%) : ${billingStatement.tva.toFixed(2)}€`,
      `✅ TOTAL TTC : ${billingStatement.totalTTC.toFixed(2)}€`
    ];
    const text = lines.join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'État des lieux — Nettoyage Express',
          text
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback('Relevé copié ! Prêt à coller par SMS, WhatsApp ou Email.');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch {
      alert(text);
    }
  };

  const COLORS = ['#38bdf8', '#f97316', '#8b5cf6', '#10b981', '#fbbf24'];
  const visibleActivities = showAllActivity ? stats.filtered.slice(0, 30) : stats.filtered.slice(0, 8);

  return (
    <div className="patron-dashboard animate-in">
      {/* Top Header with Export & Print */}
      <div className="flex-between no-print" style={{ marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.15rem' }}>Pilotage & Facturation</h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="glass"
            onClick={() => downloadCSV(billingStatement.items)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={15} /> Excel CSV
          </button>
          <button
            type="button"
            className="glass"
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--accent-gold)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              cursor: 'pointer'
            }}
          >
            <Printer size={15} /> PDF Facture
          </button>
        </div>
      </div>

      {/* 20h Push Notification Bar */}
      <div
        className="glass-card no-print"
        style={{
          padding: '0.8rem 1rem',
          marginBottom: '0.9rem',
          border: '1px solid rgba(56, 189, 248, 0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: notifEnabled ? 'rgba(14, 165, 233, 0.18)' : 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {notifEnabled ? (
              <BellRing size={18} color="var(--accent-cyan)" />
            ) : (
              <BellOff size={18} color="var(--text-secondary)" />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Rapport Push Fin de Journée (CA par Pôle)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {notifPermission === 'granted'
                ? notifEnabled
                  ? 'Actif • Bilan envoyé chaque soir sur votre téléphone'
                  : 'En pause'
                : 'Activez pour recevoir le récapitulatif chaque soir'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {notifPermission !== 'granted' ? (
            <button
              type="button"
              onClick={requestNotificationPermission}
              style={{
                background: 'var(--accent-cyan)',
                color: '#070b14',
                border: 'none',
                padding: '6px 11px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Bell size={14} /> Activer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setNotifEnabled(prev => !prev)}
              style={{
                background: notifEnabled ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255,255,255,0.08)',
                color: notifEnabled ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 10px',
                borderRadius: '10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {notifEnabled ? 'Actif' : 'Off'}
            </button>
          )}
          <button
            type="button"
            onClick={() => sendDailyRecapNotification(true)}
            style={{
              background: 'rgba(249, 115, 22, 0.16)',
              color: '#fdba74',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Tester
          </button>
        </div>
      </div>

      {/* AFFECTATION DES SALARIÉS & ATTRIBUTION DE MISSION */}
      <div
        className="glass-card no-print"
        style={{
          marginBottom: '1rem',
          padding: '1rem',
          border: '1px solid rgba(249, 115, 22, 0.32)'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fdba74' }}>
              Affectation des Salariés (Aujourd'hui)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDispatchModal(true)}
            style={{
              background: 'rgba(249, 115, 22, 0.18)',
              border: '1px solid rgba(249, 115, 22, 0.4)',
              color: '#fdba74',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Plus size={14} /> Affecter un véhicule
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users
            .filter(u => u.role !== 'patron')
            .map(emp => (
              <div
                key={emp.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '8px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: '120px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {emp.specialty || 'Salarié'} • CA: {(stats.byUser[emp.id] || 0).toFixed(0)}€
                  </div>
                </div>

                <select
                  value={emp.dailySiteId ?? 1}
                  onChange={e => updateDailyAssignment(emp.id, Number(e.target.value), emp.dailyMissionNote)}
                  className="glass"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    color: 'white',
                    background: '#0f172a',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flex: 1,
                    maxWidth: '260px'
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
            ))}
        </div>
      </div>

      {/* Site / Activity Filter Pills */}
      <div className="pill-scroll no-print" style={{ marginBottom: '0.85rem' }}>
        <button
          type="button"
          className={`btn-secondary ${selectedSite === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedSite('all')}
          style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
        >
          Toutes les activités (3 pôles)
        </button>
        {sites.map(site => (
          <button
            type="button"
            key={site.id}
            className={`btn-secondary ${selectedSite === site.id ? 'active' : ''}`}
            onClick={() => setSelectedSite(site.id)}
            style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            {site.name}
          </button>
        ))}
      </div>

      {/* Timeframe Filter */}
      <div
        className="glass no-print"
        style={{ marginBottom: '1rem', padding: '4px', borderRadius: '14px', display: 'flex', gap: '4px' }}
      >
        {['day', 'week', 'month', 'custom'].map(t => (
          <button
            type="button"
            key={t}
            onClick={() => setTimeframe(t)}
            style={{
              flex: 1,
              padding: '9px 6px',
              border: 'none',
              background: timeframe === t ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: timeframe === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: timeframe === t ? '700' : '500'
            }}
          >
            {t === 'day' ? 'Jour' : t === 'week' ? 'Semaine' : t === 'month' ? 'Mois' : 'Perso'}
          </button>
        ))}
      </div>

      {/* Custom Range Inputs */}
      <AnimatePresence>
        {timeframe === 'custom' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="no-print"
            style={{ overflow: 'hidden', marginBottom: '1rem' }}
          >
            <div className="glass-card" style={{ padding: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                  DÉBUT
                </label>
                <input
                  type="date"
                  className="glass"
                  value={customRange.start}
                  onChange={e => setCustomRange({ ...customRange, start: e.target.value })}
                  style={{ width: '100%', padding: '8px', color: 'white', border: 'none', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                  FIN
                </label>
                <input
                  type="date"
                  className="glass"
                  value={customRange.end}
                  onChange={e => setCustomRange({ ...customRange, end: e.target.value })}
                  style={{ width: '100%', padding: '8px', color: 'white', border: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid-kpi" style={{ marginBottom: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <TrendingUp size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Chiffre d'Affaires HT
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1.1 }}>
            {stats.totalRevenue.toFixed(2)}€
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            TTC (20%) : {(stats.totalRevenue * 1.2).toFixed(2)}€
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Car size={16} color="var(--accent-orange)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Véhicules Traités
            </span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
            {stats.count}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            🟢 {stats.completedCount} terminés • 🟡 {stats.inProgressCount} en cours
          </div>
        </div>
      </div>

      {/* Breakdown by the 3 Activity Poles */}
      <div className="glass-card no-print" style={{ marginBottom: '1rem', padding: '1.1rem' }}>
        <h3 style={{ fontSize: '0.85rem', marginBottom: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Répartition par Pôle d'Activité
        </h3>
        <div className="grid-3-kpi">
          <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>🚿 Garage Thorigné</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
              {(stats.byActivity['garage'] || 0).toFixed(0)}€
            </div>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ fontSize: '0.7rem', color: '#c4b5fd', fontWeight: 700 }}>🏢 Concessionnaire</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
              {(stats.byActivity['concession'] || 0).toFixed(0)}€
            </div>
          </div>
          <div style={{ background: 'rgba(249, 115, 22, 0.08)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
            <div style={{ fontSize: '0.7rem', color: '#fdba74', fontWeight: 700 }}>🚗 Convoyage</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
              {(stats.byActivity['convoyage'] || 0).toFixed(0)}€
            </div>
          </div>
        </div>
      </div>

      {/* ÉTAT DES LIEUX PAR PRESTATION (POUR FACTURATION CLIENT) */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1rem',
          padding: '1.15rem',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-green)" />
            <h3 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-green)' }}>
              État des Lieux Facturation (Par Prestation)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleShareStatement}
            className="no-print"
            style={{
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={14} /> Partager au Client
          </button>
        </div>

        {shareFeedback && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#6ee7b7',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              marginBottom: '0.75rem',
              fontWeight: 600
            }}
          >
            {shareFeedback}
          </div>
        )}

        {/* Client Filter for Invoice */}
        {availableClients.length > 0 && (
          <div className="pill-scroll no-print" style={{ marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setClientFilter('all')}
              className={`btn-secondary ${clientFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '5px 10px', fontSize: '0.74rem', borderRadius: '8px' }}
            >
              Tous les clients
            </button>
            {availableClients.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setClientFilter(c)}
                className={`btn-secondary ${clientFilter === c ? 'active' : ''}`}
                style={{ padding: '5px 10px', fontSize: '0.74rem', borderRadius: '8px', whiteSpace: 'nowrap' }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {billingStatement.rows.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
            Aucune prestation à facturer sur cette sélection
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.9rem' }}>
              {billingStatement.rows.map(row => (
                <div
                  key={row.serviceName}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    padding: '0.75rem'
                  }}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{row.serviceName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        Quantité : <b>{row.count} véhicule{row.count > 1 ? 's' : ''}</b>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                        {row.totalHT.toFixed(2)}€ HT
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        {(row.totalHT * 1.2).toFixed(2)}€ TTC
                      </div>
                    </div>
                  </div>
                  {row.plates.length > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Immatriculations : <span style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{row.plates.join(' • ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              className="flex-between"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  TOTAL À FACTURER ({billingStatement.items.length} véh.)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  TVA 20% : {billingStatement.tva.toFixed(2)}€ • TTC : <b>{billingStatement.totalTTC.toFixed(2)}€</b>
                </div>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                {billingStatement.totalHT.toFixed(2)}€ HT
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid-charts no-print" style={{ marginBottom: '1rem' }}>
        {/* Service Chart */}
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
              CA par Prestation
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{chartData.length} types</span>
          </div>

          {chartData.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Aucune prestation sur cette période
            </div>
          ) : (
            <div style={{ width: '100%', height: '215px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 24, right: 12, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={v => `${v}€`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '12px', color: 'white' }}
                    formatter={value => [`${Number(value).toFixed(2)}€ HT`, 'Chiffre d\'Affaires']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={46}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={v => `${v}€`} style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Employee Performance Chart */}
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
              Activité par Salarié
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{employeeChartData.length} salariés</span>
          </div>

          {employeeChartData.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Aucune activité salarié sur cette période
            </div>
          ) : (
            <div style={{ width: '100%', height: `${Math.max(150, employeeChartData.length * 48)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeChartData} layout="vertical" margin={{ top: 6, right: 60, left: 4, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="shortName"
                    type="category"
                    width={88}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#f8fafc', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '12px', color: 'white' }}
                    formatter={(value, name, props) => [`${Number(value).toFixed(2)}€ (${props.payload.count} véh.)`, 'Activité']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                    {employeeChartData.map((entry, index) => (
                      <Cell key={`emp-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" formatter={v => `${v}€`} style={{ fill: '#38bdf8', fontSize: '12px', fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Vehicle Operations & Convoyage Tracking */}
      <div className="glass-card" style={{ padding: '1.15rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Journal des Véhicules & Convoyages
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {stats.filtered.length} entrée{stats.filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
              Aucun véhicule enregistré sur cette période
            </p>
          ) : (
            visibleActivities.map(t => {
              const isNegative = t.amount < 0;
              const isCancelled = Boolean(t.isCancelled);
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    opacity: isCancelled ? 0.55 : 1
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      {t.plateNumber && (
                        <div className="license-plate">
                          <span>{t.plateNumber}</span>
                        </div>
                      )}
                      {!isNegative && !isCancelled && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontWeight: 700,
                            background: t.status === 'en_cours' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: t.status === 'en_cours' ? '#fdba74' : '#34d399'
                          }}
                        >
                          {t.status === 'en_cours'
                            ? '🟡 Pris en charge (En cours)'
                            : t.activityType === 'convoyage'
                            ? '🟢 Livré à Rennes'
                            : '🟢 Chantier Terminé'}
                        </span>
                      )}
                      {isCancelled && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background: 'rgba(251, 113, 133, 0.15)',
                            color: 'var(--accent-rose)',
                            fontWeight: 700
                          }}
                        >
                          Annulée
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: isNegative ? 'var(--accent-rose)' : 'white',
                        textDecoration: isCancelled ? 'line-through' : 'none'
                      }}
                    >
                      {isNegative ? `Annulation • ${t.serviceName}` : t.serviceName}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      👤 <b>{t.employeName}</b> • {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {t.deliveredAt && t.status !== 'en_cours'
                        ? ` → Fin ${new Date(t.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : ''}
                      {t.clientName ? ` • ${t.clientName}` : ''}
                    </div>

                    {t.activityType === 'convoyage' && (
                      <div style={{ fontSize: '0.74rem', color: '#fdba74', marginTop: '2px' }}>
                        📍 {t.pickupLocation} → {t.dropoffLocation}
                        {t.mileageStart !== '' && t.mileageStart !== undefined ? ` • Km départ: ${t.mileageStart} km` : ''}
                        {t.mileageEnd ? ` → Arrivée: ${t.mileageEnd} km` : ''}
                      </div>
                    )}

                    {t.notes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note : {t.notes}
                      </div>
                    )}

                    {/* Photos & Quick Actions */}
                    <div className="no-print" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {t.platePhoto && (
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto({ url: t.platePhoto, label: `Plaque ${t.plateNumber}` })}
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: 'var(--accent-cyan)',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ImageIcon size={12} /> Photo Plaque
                        </button>
                      )}
                      {t.afterPhoto && (
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto({ url: t.afterPhoto, label: `Fin de chantier ${t.plateNumber}` })}
                          style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: 'var(--accent-green)',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sparkles size={12} /> Photo Fin Chantier
                        </button>
                      )}
                      {t.status === 'en_cours' && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => completeIntervention(t.id)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid var(--accent-green)',
                            color: '#6ee7b7',
                            padding: '3px 9px',
                            borderRadius: '8px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle2 size={12} /> Marquer {t.activityType === 'convoyage' ? 'Livré' : 'Terminé'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: isNegative ? 'var(--accent-rose)' : isCancelled ? 'var(--text-secondary)' : 'var(--accent-cyan)',
                        textDecoration: isCancelled ? 'line-through' : 'none'
                      }}
                    >
                      {isNegative ? '' : '+'}{Number(t.amount).toFixed(2)}€
                    </div>

                    {t.amount > 0 && !isCancelled && (
                      <button
                        type="button"
                        className="no-print"
                        onClick={() => {
                          if (
                            confirm(
                              `Annuler cette prestation (${t.plateNumber} - ${t.serviceName}) ? Le chiffre d'affaires sera recalculé.`
                            )
                          ) {
                            cancelTransaction(t);
                          }
                        }}
                        style={{
                          background: 'rgba(251, 113, 133, 0.12)',
                          border: '1px solid rgba(251, 113, 133, 0.25)',
                          color: 'var(--accent-rose)',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {stats.filtered.length > 8 && (
          <button
            type="button"
            className="no-print"
            onClick={() => setShowAllActivity(prev => !prev)}
            style={{
              width: '100%',
              marginTop: '0.85rem',
              padding: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--surface-border)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {showAllActivity ? (
              <>Voir moins <ChevronUp size={16} /></>
            ) : (
              <>Voir tout ({stats.filtered.length}) <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      {/* Modal Affecter un véhicule / mission à un salarié */}
      <AnimatePresence>
        {showDispatchModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 3200,
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
              style={{ width: '100%', maxWidth: '430px', position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <X size={22} />
              </button>

              <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', color: '#fdba74' }}>
                📋 Affecter un Véhicule / Mission à un Salarié
              </h3>

              <form onSubmit={handleDispatchMission}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                    Salarié affecté *
                  </label>
                  <select
                    className="glass"
                    style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a', fontWeight: 700 }}
                    value={dispatchForm.employeId}
                    onChange={e => setDispatchForm({ ...dispatchForm, employeId: e.target.value })}
                  >
                    {users.filter(u => u.role !== 'patron').map(u => (
                      <option key={u.id} value={u.id}>
                        👤 {u.name} ({u.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid-kpi" style={{ marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                      Pôle / Site
                    </label>
                    <select
                      className="glass"
                      style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a', fontSize: '0.82rem' }}
                      value={dispatchForm.siteId}
                      onChange={e => {
                        const sId = Number(e.target.value);
                        const sObj = sites.find(s => Number(s.id) === sId);
                        const firstService = services.find(sv => sv.category === sObj?.category);
                        setDispatchForm({
                          ...dispatchForm,
                          siteId: sId,
                          serviceId: firstService ? firstService.id : dispatchForm.serviceId
                        });
                      }}
                    >
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                      Prestation
                    </label>
                    <select
                      className="glass"
                      style={{ width: '100%', padding: '10px', color: 'white', background: '#0f172a', fontSize: '0.82rem' }}
                      value={dispatchForm.serviceId}
                      onChange={e => setDispatchForm({ ...dispatchForm, serviceId: e.target.value })}
                    >
                      {services.map(sv => (
                        <option key={sv.id} value={sv.id}>{sv.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-kpi" style={{ marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                      Immatriculation *
                    </label>
                    <input
                      type="text"
                      className="glass"
                      placeholder="AB-123-CD"
                      style={{ width: '100%', padding: '10px', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                      value={dispatchForm.plateNumber}
                      onChange={e => setDispatchForm({ ...dispatchForm, plateNumber: formatLicensePlate(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                      Km Départ (si convoyage)
                    </label>
                    <input
                      type="number"
                      className="glass"
                      placeholder="Ex: 34500"
                      style={{ width: '100%', padding: '10px', color: 'white' }}
                      value={dispatchForm.mileageStart}
                      onChange={e => setDispatchForm({ ...dispatchForm, mileageStart: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                    Consigne / Note pour le salarié
                  </label>
                  <input
                    type="text"
                    className="glass"
                    placeholder="Ex: Récupérer clés à l'accueil Super U, livrer avant 16h..."
                    style={{ width: '100%', padding: '10px', color: 'white', fontSize: '0.84rem' }}
                    value={dispatchForm.notes}
                    onChange={e => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-orange" style={{ width: '100%' }}>
                  <UserCheck size={18} /> Envoyer la mission au salarié
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Preview */}
      <AnimatePresence>
        {previewPhoto && (
          <div
            onClick={() => setPreviewPhoto(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.9)',
              zIndex: 3500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div style={{ marginBottom: '0.75rem', fontWeight: 700, fontSize: '1rem' }}>{previewPhoto.label}</div>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.label}
              style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)' }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPreviewPhoto(null)}
              style={{ marginTop: '1rem' }}
            >
              Fermer l'aperçu
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatronDashboard;

