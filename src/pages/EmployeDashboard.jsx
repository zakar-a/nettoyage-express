import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext, formatLicensePlate, compressImageFile } from '../context/AppContext';
import {
  Car,
  Truck,
  Building2,
  Navigation,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Gauge,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POLE_META = {
  garage: {
    key: 'garage',
    title: 'Garage Thorigné',
    subtitle: 'Voitures & Camions',
    activeClass: 'active-garage',
    icon: Sparkles
  },
  concession: {
    key: 'concession',
    title: 'Sur Place',
    subtitle: 'Concessionnaire',
    activeClass: 'active-concession',
    icon: Building2
  },
  convoyage: {
    key: 'convoyage',
    title: 'Convoyage',
    subtitle: 'Super U → Rennes',
    activeClass: 'active-convoyage',
    icon: Navigation
  }
};

const EmployeDashboard = () => {
  const {
    sites,
    users,
    services,
    transactions,
    addIntervention,
    completeIntervention,
    cancelTransaction,
    getStats,
    currentUser
  } = useAppContext();

  const isPatron = currentUser?.role === 'patron';

  // Sync currentUser with latest user object from users state
  const liveUser = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.id === currentUser.id) || currentUser;
  }, [users, currentUser]);

  // Sites/Poles allowed for this employee based on their affectation
  const allowedSites = useMemo(() => {
    if (isPatron) return sites;
    if (liveUser?.dailySiteId === 0) return [];
    const assignedIds = (liveUser?.assignedSites || []).map(Number);
    if (assignedIds.length > 0) {
      const matched = sites.filter(s => assignedIds.includes(Number(s.id)));
      if (matched.length > 0) return matched;
    }
    if (liveUser?.dailySiteId) {
      const daily = sites.find(s => Number(s.id) === Number(liveUser.dailySiteId));
      if (daily) return [daily];
    }
    return sites;
  }, [sites, liveUser, isPatron]);

  const allowedPoleKeys = useMemo(() => {
    const keys = [];
    allowedSites.forEach(s => {
      if (s.category && !keys.includes(s.category)) {
        keys.push(s.category);
      }
    });
    return keys;
  }, [allowedSites]);

  // Default to the employee's daily assigned site category
  const assignedDailySite = useMemo(() => {
    if (liveUser?.dailySiteId === 0) return null;
    const targetId = liveUser?.dailySiteId ?? liveUser?.assignedSites?.[0] ?? 1;
    return sites.find(s => Number(s.id) === Number(targetId)) || allowedSites[0] || sites[0];
  }, [sites, liveUser, allowedSites]);

  const [activePole, setActivePole] = useState(() => assignedDailySite?.category || allowedPoleKeys[0] || 'garage');
  const [selectedEmployeId, setSelectedEmployeId] = useState(() => currentUser?.id || 'u2');

  // Keep activePole strictly inside the employee's allowed affectations when affectation changes
  useEffect(() => {
    if (!isPatron && allowedPoleKeys.length > 0 && !allowedPoleKeys.includes(activePole)) {
      setActivePole(assignedDailySite?.category || allowedPoleKeys[0]);
    } else if (!isPatron && assignedDailySite?.category && allowedPoleKeys.length === 1) {
      setActivePole(assignedDailySite.category);
    }
  }, [isPatron, allowedPoleKeys, assignedDailySite, activePole]);

  const currentSite = useMemo(() => {
    return sites.find(s => s.category === activePole) || assignedDailySite || sites[0];
  }, [sites, activePole, assignedDailySite]);

  const poleServices = useMemo(() => {
    return services.filter(s => s.category === activePole);
  }, [services, activePole]);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const activeService = useMemo(() => {
    return poleServices.find(s => s.id === selectedServiceId) || poleServices[0];
  }, [poleServices, selectedServiceId]);

  // Vehicle & Mission form state
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Voiture');
  const [clientName, setClientName] = useState('');
  const [mileageStart, setMileageStart] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Parc Super U Thorigné');
  const [dropoffLocation, setDropoffLocation] = useState('Concessionnaire Rennes');
  const [notes, setNotes] = useState('');
  const [platePhoto, setPlatePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  // Delivery / Completion modal state for in-progress vehicles
  const [completingTx, setCompletingTx] = useState(null);
  const [deliveryMileageEnd, setDeliveryMileageEnd] = useState('');
  const [deliveryAfterPhoto, setDeliveryAfterPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const plateInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const completePhotoRef = useRef(null);

  const dailyStats = useMemo(() => getStats('day'), [transactions, currentUser]);

  // Filter employee's history & in-progress missions to their affectation
  const employeeFilteredActivities = useMemo(() => {
    if (isPatron) return dailyStats.filtered;
    return dailyStats.filtered.filter(
      t =>
        t.employeId === liveUser?.id &&
        (allowedPoleKeys.length === 0 || allowedPoleKeys.includes(t.activityType))
    );
  }, [dailyStats, isPatron, liveUser, allowedPoleKeys]);

  const inProgressMissions = useMemo(() => {
    return transactions.filter(t => {
      if (t.amount <= 0 || t.status !== 'en_cours') return false;
      if (isPatron) return true;
      return (
        t.employeId === liveUser?.id &&
        (allowedPoleKeys.length === 0 || allowedPoleKeys.includes(t.activityType))
      );
    });
  }, [transactions, isPatron, liveUser, allowedPoleKeys]);

  const employeeCounts = useMemo(() => {
    const activePos = employeeFilteredActivities.filter(t => t.amount > 0 && !t.isCancelled);
    const total = activePos.length;
    const inProg = activePos.filter(t => t.status === 'en_cours').length;
    const done = activePos.filter(t => t.status === 'livre' || t.status === 'termine').length;
    return { total, inProg, done };
  }, [employeeFilteredActivities]);

  const triggerFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2600);
  };

  const handlePhotoCapture = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 900, 0.74);
      setter(compressed);
    } catch (err) {
      console.error('Erreur photo:', err);
    }
  };

  const handleSubmitIntervention = async (e, statusOverride = null) => {
    e.preventDefault();
    if (!activeService) return;

    const cleanPlate = formatLicensePlate(plateNumber);
    if (!cleanPlate) {
      alert("Veuillez renseigner l'immatriculation du véhicule (ex: AB-123-CD).");
      return;
    }

    if (activePole === 'convoyage' && !mileageStart) {
      alert('Veuillez indiquer le kilométrage du véhicule à la prise en charge.');
      return;
    }

    const isConvoyage = activePole === 'convoyage';
    const finalStatus = statusOverride || (isConvoyage ? 'en_cours' : 'termine');

    const tx = await addIntervention({
      employeId: isPatron ? selectedEmployeId : liveUser.id,
      siteId: currentSite?.id || 1,
      activityType: activePole,
      serviceId: activeService.id,
      vehicleType: activeService.vehicleType || vehicleType,
      clientName: clientName || currentSite?.defaultClient || 'Client',
      plateNumber: cleanPlate,
      platePhoto,
      afterPhoto,
      mileageStart,
      pickupLocation: isConvoyage ? pickupLocation : currentSite?.name,
      dropoffLocation: isConvoyage ? dropoffLocation : currentSite?.name,
      status: finalStatus,
      notes
    });

    if (tx) {
      triggerFeedback(
        isConvoyage && finalStatus === 'en_cours'
          ? `🚗 ${cleanPlate} pris en charge (${mileageStart} km)`
          : `✅ ${cleanPlate} • ${activeService.name} validé !`,
        'success'
      );
      setPlateNumber('');
      setMileageStart('');
      setNotes('');
      setPlatePhoto(null);
      setAfterPhoto(null);
    }
  };

  const handleConfirmDeliveryOrFinish = async (e) => {
    e.preventDefault();
    if (!completingTx) return;

    await completeIntervention(completingTx.id, {
      mileageEnd: deliveryMileageEnd,
      afterPhoto: deliveryAfterPhoto || completingTx.afterPhoto
    });

    triggerFeedback(
      completingTx.activityType === 'convoyage'
        ? `🏁 Véhicule ${completingTx.plateNumber} déclaré LIVRÉ à Rennes !`
        : `✨ Chantier ${completingTx.plateNumber} clôturé avec photo !`,
      'success'
    );

    setCompletingTx(null);
    setDeliveryMileageEnd('');
    setDeliveryAfterPhoto(null);
  };

  // If employee is set to "Repos / Non affecté" by Patron
  if (!isPatron && allowedPoleKeys.length === 0) {
    return (
      <div className="glass-card animate-in" style={{ textAlign: 'center', padding: '2.5rem 1.25rem' }}>
        <Clock size={36} color="var(--accent-orange)" style={{ marginBottom: '0.75rem' }} />
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Aucune affectation active aujourd'hui</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Votre profil est actuellement marqué en repos ou sans affectation de poste. Contactez la direction pour activer votre pôle du jour.
        </p>
      </div>
    );
  }

  return (
    <div className="employe-dashboard animate-in">
      {/* Daily Assignment Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1rem',
          padding: '0.85rem 1rem',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(15, 23, 42, 0.95))'
        }}
      >
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MapPin size={18} color="#070b14" />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Votre Affectation Active
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800 }}>
                {currentSite ? currentSite.name : assignedDailySite?.name}
              </div>
              {liveUser?.dailyMissionNote && (
                <div style={{ fontSize: '0.74rem', color: '#fdba74', marginTop: '2px', fontWeight: 600 }}>
                  📋 Consigne : {liveUser.dailyMissionNote}
                </div>
              )}
            </div>
          </div>

          {isPatron && (
            <div>
              <label style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: 700 }}>
                SALARIÉ AFFECTÉ À CETTE SAISIE :
              </label>
              <select
                value={selectedEmployeId}
                onChange={e => setSelectedEmployeId(e.target.value)}
                className="glass"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  color: 'white',
                  background: '#0f172a',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    👤 {u.name} ({u.specialty || u.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 1. Pole d'Activité Selector — Only shown if employee has more than 1 assigned pole (or for Patron) */}
      {allowedPoleKeys.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '0.5rem',
              fontWeight: 700
            }}
          >
            Pôles de votre affectation
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {allowedPoleKeys.map(poleKey => {
              const meta = POLE_META[poleKey];
              if (!meta) return null;
              const IconComp = meta.icon;
              return (
                <button
                  key={poleKey}
                  type="button"
                  onClick={() => {
                    setActivePole(poleKey);
                    setSelectedServiceId('');
                  }}
                  className={`activity-tab ${activePole === poleKey ? meta.activeClass : ''}`}
                >
                  <IconComp size={20} />
                  <span>{meta.title}</span>
                  <small style={{ fontSize: '0.63rem', opacity: 0.8 }}>{meta.subtitle}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* In-Progress Vehicles Banner (Filtered to employee's affectation) */}
      {inProgressMissions.length > 0 && (
        <div
          className="glass-card"
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid rgba(249, 115, 22, 0.45)',
            background: 'linear-gradient(145deg, rgba(249, 115, 22, 0.12), rgba(15, 23, 42, 0.95))'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '0.9rem', color: '#fdba74', textTransform: 'uppercase' }}>
                Véhicules en cours ({inProgressMissions.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              À clôturer / livrer
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inProgressMissions.map(mission => (
              <div
                key={mission.id}
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: '14px',
                  padding: '0.8rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <div className="license-plate">
                      <span>{mission.plateNumber || 'SANS-PLAQUE'}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: 'rgba(249, 115, 22, 0.2)',
                        color: '#fdba74',
                        fontWeight: 700
                      }}
                    >
                      {mission.activityType === 'convoyage' ? '🟡 Pris en charge' : '🟡 En chantier'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{mission.serviceName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {mission.activityType === 'convoyage' ? (
                      <>
                        {mission.pickupLocation} → {mission.dropoffLocation}
                        {mission.mileageStart ? ` • Départ: ${mission.mileageStart} km` : ''}
                      </>
                    ) : (
                      <>{mission.siteName}</>
                    )}
                  </div>
                  {mission.notes && (
                    <div style={{ fontSize: '0.72rem', color: '#fdba74', marginTop: '2px' }}>
                      📋 {mission.notes}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-green"
                  onClick={() => {
                    setCompletingTx(mission);
                    setDeliveryMileageEnd(mission.mileageStart ? String(Number(mission.mileageStart) + 15) : '');
                    setDeliveryAfterPhoto(null);
                  }}
                  style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', flexShrink: 0 }}
                >
                  <CheckCircle2 size={16} />
                  {mission.activityType === 'convoyage' ? 'Déclarer Livré' : 'Terminer + Photo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Prestation Selection (Prices hidden for employees, visible only for Patron/Admin) */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '0.5rem',
            fontWeight: 700
          }}
        >
          Prestations de votre affectation ({currentSite?.name})
        </div>
        <div className="grid-kpi">
          {poleServices.map(service => {
            const isSelected = activeService?.id === service.id;
            const price =
              (service.prices &&
                (service.prices[currentSite?.id] ?? service.prices[String(currentSite?.id)])) ||
              0;
            const isTruck = service.vehicleType?.toLowerCase().includes('camion');
            return (
              <button
                type="button"
                key={service.id}
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setVehicleType(service.vehicleType || 'Voiture');
                }}
                className={`service-btn ${service.color} ${isSelected ? 'selected' : ''}`}
              >
                {isTruck ? (
                  <Truck size={26} />
                ) : activePole === 'convoyage' ? (
                  <Navigation size={26} />
                ) : (
                  <Car size={26} />
                )}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.25 }}>{service.name}</div>
                  {isPatron ? (
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>{price}€</div>
                  ) : (
                    <div
                      style={{
                        fontSize: '0.68rem',
                        opacity: 0.8,
                        marginTop: '5px',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: 'rgba(255,255,255,0.08)',
                        display: 'inline-block'
                      }}
                    >
                      {service.vehicleType || 'Voiture'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Vehicle Identification, Photos & Validation Form */}
      <form onSubmit={(e) => handleSubmitIntervention(e)} className="glass-card" style={{ marginBottom: '1rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.9rem' }}>
          <h3 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)' }}>
            {activePole === 'convoyage'
              ? 'Prise en Charge Véhicule (Convoyage)'
              : 'Fiche Véhicule & Photos Chantier'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {activeService?.name}
          </span>
        </div>

        {/* License Plate Input + Camera Button */}
        <div style={{ marginBottom: '0.9rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            Immatriculation du véhicule *
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            <div
              className="glass"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                border: '1px solid rgba(56, 189, 248, 0.35)'
              }}
            >
              <span
                style={{
                  background: '#003399',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '4px 6px',
                  borderRadius: '4px',
                  marginRight: '8px'
                }}
              >
                F
              </span>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(formatLicensePlate(e.target.value))}
                placeholder="AB-123-CD"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  width: '100%',
                  outline: 'none',
                  padding: '10px 0',
                  textTransform: 'uppercase'
                }}
                required
              />
            </div>

            <input
              ref={plateInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handlePhotoCapture(e, setPlatePhoto)}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => plateInputRef.current?.click()}
              style={{
                background: platePhoto ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.16)',
                border: platePhoto ? '1px solid var(--accent-green)' : '1px solid rgba(56, 189, 248, 0.35)',
                color: platePhoto ? 'var(--accent-green)' : 'var(--accent-cyan)',
                padding: '0 14px',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                fontSize: '0.68rem',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              <Camera size={18} />
              <span>{platePhoto ? 'Plaque OK' : 'Photo Plaque'}</span>
            </button>
          </div>
        </div>

        {/* Convoyage Specific Fields: Kilométrage & Trajet Super U -> Rennes */}
        {activePole === 'convoyage' && (
          <div
            style={{
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              borderRadius: '14px',
              padding: '0.85rem',
              marginBottom: '0.9rem'
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: '#fdba74',
                  marginBottom: '4px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                <Gauge size={14} /> Kilométrage au compteur (Prise en charge) *
              </label>
              <input
                type="number"
                value={mileageStart}
                onChange={(e) => setMileageStart(e.target.value)}
                placeholder="Ex: 42500"
                className="glass"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  color: 'white',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
                required
              />
            </div>

            <div className="grid-kpi">
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                  LIEU DE DÉPART
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="glass"
                  style={{ width: '100%', padding: '8px 10px', color: 'white', border: 'none', fontSize: '0.82rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>
                  DESTINATION (LIVRAISON)
                </label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  className="glass"
                  style={{ width: '100%', padding: '8px 10px', color: 'white', border: 'none', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Photos Section: Plaque Photo + Fin de chantier (Après lavage) */}
        <div style={{ marginBottom: '0.9rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            Photos justificatives (Plaque & Fin de chantier)
          </label>

          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handlePhotoCapture(e, setAfterPhoto)}
            style={{ display: 'none' }}
          />

          <div className="grid-kpi">
            <div
              onClick={() => plateInputRef.current?.click()}
              className="glass"
              style={{
                padding: '10px',
                borderRadius: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                border: platePhoto ? '1px solid var(--accent-green)' : '1px dashed rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '88px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {platePhoto ? (
                <>
                  <img
                    src={platePhoto}
                    alt="Plaque"
                    style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '8px', marginBottom: '4px' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    📸 Photo Plaque OK
                  </span>
                </>
              ) : (
                <>
                  <Camera size={22} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>Photo Plaque</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Immatriculation</span>
                </>
              )}
            </div>

            <div
              onClick={() => afterInputRef.current?.click()}
              className="glass"
              style={{
                padding: '10px',
                borderRadius: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                border: afterPhoto ? '1px solid var(--accent-green)' : '1px dashed rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '88px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {afterPhoto ? (
                <>
                  <img
                    src={afterPhoto}
                    alt="Fin de chantier"
                    style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '8px', marginBottom: '4px' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    ✨ Photo Après Lavage OK
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={22} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '4px' }}>Photo Fin Chantier</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Après lavage / État</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Client & Observation */}
        <div className="grid-kpi" style={{ marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              CLIENT / CONCESSION
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={currentSite?.defaultClient || 'Ex: Concessionnaire Rennes'}
              className="glass"
              style={{ width: '100%', padding: '9px 10px', color: 'white', border: 'none', fontSize: '0.82rem', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              OBSERVATION (OPTIONNEL)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Rayure pare-choc, microbillage..."
              className="glass"
              style={{ width: '100%', padding: '9px 10px', color: 'white', border: 'none', fontSize: '0.82rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        {activePole === 'convoyage' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="submit" className="btn-orange" style={{ width: '100%' }}>
              <Navigation size={18} />
              Déclarer Pris en Charge (Départ Super U)
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmitIntervention(e, 'livre')}
              className="btn-green"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.82rem' }}
            >
              <CheckCircle2 size={16} />
              Enregistrer directement comme Livré à Rennes
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              <CheckCircle2 size={18} />
              Valider la Prestation ({activeService?.name})
            </button>
            {!afterPhoto && (
              <button
                type="button"
                onClick={(e) => handleSubmitIntervention(e, 'en_cours')}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.78rem', padding: '0.65rem' }}
              >
                <Clock size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                Démarrer le lavage (Ajouter la photo de fin plus tard)
              </button>
            )}
          </div>
        )}
      </form>

      {/* Personal Daily Stats — No prices for employees! */}
      <div className="glass-card" style={{ padding: '1.1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Votre Activité — Aujourd'hui
        </h3>
        <div className="grid-3-kpi">
          <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {employeeCounts.total}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Véhicules</div>
          </div>
          <div style={{ background: 'rgba(249, 115, 22, 0.08)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
              {employeeCounts.inProg}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>En cours</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green)' }}>
              {isPatron ? `${dailyStats.totalRevenue.toFixed(0)}€` : employeeCounts.done}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {isPatron ? 'CA Jour HT' : 'Terminés / Livrés'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Employee Operations (Filtered to affectation & without prices for employees) */}
      <div className="glass-card" style={{ padding: '1.1rem' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Vos Dernières Interventions ({currentSite?.name})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {employeeFilteredActivities.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
              Aucune intervention enregistrée aujourd'hui sur votre affectation
            </p>
          ) : (
            employeeFilteredActivities.slice(0, 10).map(t => {
              const isNegative = t.amount < 0;
              const isCancelled = Boolean(t.isCancelled);
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    opacity: isCancelled ? 0.55 : 1
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      {t.plateNumber && (
                        <div className="license-plate" style={{ transform: 'scale(0.92)', transformOrigin: 'left center' }}>
                          <span>{t.plateNumber}</span>
                        </div>
                      )}
                      {!isNegative && !isCancelled && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 7px',
                            borderRadius: '99px',
                            fontWeight: 700,
                            background:
                              t.status === 'en_cours'
                                ? 'rgba(249, 115, 22, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                            color: t.status === 'en_cours' ? '#fdba74' : '#34d399'
                          }}
                        >
                          {t.status === 'en_cours'
                            ? '🟡 Pris en charge'
                            : t.activityType === 'convoyage'
                            ? '🟢 Livré'
                            : '🟢 Terminé'}
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
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        color: isNegative ? 'var(--accent-rose)' : 'white',
                        textDecoration: isCancelled ? 'line-through' : 'none'
                      }}
                    >
                      {isNegative ? `Annulation • ${t.serviceName}` : t.serviceName}
                    </div>

                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {t.mileageStart ? ` • ${t.mileageStart} km` : ''}
                      {t.mileageEnd ? ` → ${t.mileageEnd} km` : ''}
                      {t.clientName ? ` • ${t.clientName}` : ''}
                    </div>

                    {(t.platePhoto || t.afterPhoto) && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
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
                            <Sparkles size={12} /> Photo Après Lavage
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isPatron && (
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
                    )}

                    {t.amount > 0 && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Annuler cette prestation (${t.plateNumber} - ${t.serviceName}) ?`)) {
                            cancelTransaction(t);
                            triggerFeedback('Prestation annulée', 'cancel');
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
      </div>

      {/* Modal to Mark Convoyage as Delivered or Add End-of-Job Photo */}
      <AnimatePresence>
        {completingTx && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 3000,
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
              style={{ width: '100%', maxWidth: '410px', position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setCompletingTx(null)}
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

              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                {completingTx.activityType === 'convoyage'
                  ? '🏁 Confirmer la Livraison du Véhicule'
                  : '✨ Clôturer le Lavage (Fin de Chantier)'}
              </h3>

              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="license-plate">
                  <span>{completingTx.plateNumber}</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {completingTx.serviceName}
                </span>
              </div>

              <form onSubmit={handleConfirmDeliveryOrFinish}>
                {completingTx.activityType === 'convoyage' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: 700
                      }}
                    >
                      Kilométrage à l'arrivée ({completingTx.dropoffLocation})
                    </label>
                    <input
                      type="number"
                      value={deliveryMileageEnd}
                      onChange={(e) => setDeliveryMileageEnd(e.target.value)}
                      placeholder={`Départ: ${completingTx.mileageStart || 0} km`}
                      className="glass"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        color: 'white',
                        border: '1px solid var(--surface-border)',
                        fontSize: '1rem',
                        fontWeight: 700
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1.2rem' }}>
                  <label
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 700
                    }}
                  >
                    Photo de Fin de Chantier / Livraison
                  </label>
                  <input
                    ref={completePhotoRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoCapture(e, setDeliveryAfterPhoto)}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => completePhotoRef.current?.click()}
                    className="glass"
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: deliveryAfterPhoto ? '1px solid var(--accent-green)' : '1px dashed rgba(56, 189, 248, 0.4)'
                    }}
                  >
                    {deliveryAfterPhoto ? (
                      <>
                        <img
                          src={deliveryAfterPhoto}
                          alt="Livraison"
                          style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '6px' }}
                        />
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                          Photo enregistrée (Cliquer pour changer)
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera size={26} color="var(--accent-cyan)" />
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '6px' }}>
                          Prendre la photo de fin
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          Véhicule lavé ou livré sur parc
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-green" style={{ width: '100%' }}>
                  <CheckCircle2 size={18} />
                  {completingTx.activityType === 'convoyage'
                    ? 'Valider Livraison à Rennes'
                    : 'Valider Fin de Chantier'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Preview Modal */}
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

      {/* Toast Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'fixed',
              bottom: '88px',
              left: '1rem',
              right: '1rem',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 3200,
              pointerEvents: 'none'
            }}
          >
            <div
              className="glass"
              style={{
                background: feedback.type === 'cancel' ? 'rgba(251, 113, 133, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                backdropFilter: 'blur(20px)',
                border:
                  feedback.type === 'cancel'
                    ? '1px solid rgba(251, 113, 133, 0.45)'
                    : '1px solid rgba(16, 185, 129, 0.45)',
                color: feedback.type === 'cancel' ? '#fda4af' : '#6ee7b7',
                padding: '12px 22px',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              <CheckCircle2 size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{feedback.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeDashboard;
