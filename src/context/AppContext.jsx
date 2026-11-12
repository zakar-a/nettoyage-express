import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const INITIAL_SITES = [
  {
    id: 1,
    name: 'Garage Thorigné-Fouillard',
    category: 'garage',
    location: '6 Rue Antoine de Saint Exupéry, 35235 Thorigné-Fouillard',
    defaultClient: 'Atelier Thorigné'
  },
  {
    id: 2,
    name: 'Sur Site • Concessionnaire Rennes',
    category: 'concession',
    location: 'Centre de service Concessionnaire — Rennes',
    defaultClient: 'Concessionnaire Rennes'
  },
  {
    id: 3,
    name: 'Convoyage & Gardiennage (Super U → Rennes)',
    category: 'convoyage',
    location: 'Parc Super U → Concessionnaire Rennes',
    defaultClient: 'Concessionnaire Rennes'
  }
];

const INITIAL_USERS = [
  {
    id: 'u1',
    username: 'patron',
    password: '123',
    name: 'Direction Nettoyage Express',
    role: 'patron',
    specialty: 'Gérant',
    assignedSites: [1, 2, 3],
    dailySiteId: 1,
    dailyMissionNote: 'Supervision générale des 3 pôles'
  },
  {
    id: 'u2',
    username: 'karim',
    password: '123',
    name: 'Karim',
    role: 'employe',
    specialty: 'Lavage & Esthétique',
    assignedSites: [1, 2],
    dailySiteId: 2,
    dailyMissionNote: 'Préparation véhicules VO/VN chez le Concessionnaire Rennes'
  },
  {
    id: 'u3',
    username: 'yassine',
    password: '123',
    name: 'Yassine',
    role: 'employe',
    specialty: 'Convoyeur & Préparateur',
    assignedSites: [2, 3],
    dailySiteId: 3,
    dailyMissionNote: 'Rotation convoyage Parc Super U → Concessionnaire Rennes'
  },
  {
    id: 'u4',
    username: 'mehdi',
    password: '123',
    name: 'Mehdi',
    role: 'employe',
    specialty: 'Lavage Camions & Garage',
    assignedSites: [1],
    dailySiteId: 1,
    dailyMissionNote: 'Lavage camions/utilitaires & voitures au Garage Thorigné'
  }
];

const INITIAL_SERVICES = [
  // Pôle 1 : Garage Thorigné-Fouillard (Voitures & Camions)
  {
    id: 'lavage-complet-voiture',
    name: 'Lavage Complet Voiture (Int/Ext)',
    category: 'garage',
    vehicleType: 'Voiture',
    color: 'garage',
    prices: { 1: 65, 2: 55, 3: 65 }
  },
  {
    id: 'lavage-ext-voiture',
    name: 'Lavage Extérieur Express',
    category: 'garage',
    vehicleType: 'Voiture',
    color: 'garage',
    prices: { 1: 30, 2: 25, 3: 30 }
  },
  {
    id: 'esthetique-lustrage',
    name: 'Rénovation Esthétique & Lustrage',
    category: 'garage',
    vehicleType: 'Voiture',
    color: 'garage',
    prices: { 1: 140, 2: 120, 3: 140 }
  },
  {
    id: 'lavage-camion-utilitaire',
    name: 'Lavage Camion / Utilitaire',
    category: 'garage',
    vehicleType: 'Camion / Utilitaire',
    color: 'camion',
    prices: { 1: 95, 2: 90, 3: 95 }
  },
  {
    id: 'lavage-poids-lourd',
    name: 'Lavage Poids Lourd / Extérieur',
    category: 'garage',
    vehicleType: 'Camion / Utilitaire',
    color: 'camion',
    prices: { 1: 145, 2: 145, 3: 145 }
  },
  // Pôle 2 : Sur place chez le Concessionnaire
  {
    id: 'prepa-vn-concession',
    name: 'Préparation Véhicule Neuf (VN)',
    category: 'concession',
    vehicleType: 'Voiture',
    color: 'concession',
    prices: { 1: 45, 2: 45, 3: 45 }
  },
  {
    id: 'prepa-vo-concession',
    name: 'Remise à Neuf Occasion (VO)',
    category: 'concession',
    vehicleType: 'Voiture',
    color: 'concession',
    prices: { 1: 75, 2: 75, 3: 75 }
  },
  {
    id: 'lavage-hall-expo',
    name: 'Lavage Parc / Hall Concession',
    category: 'concession',
    vehicleType: 'Voiture',
    color: 'concession',
    prices: { 1: 25, 2: 25, 3: 25 }
  },
  // Pôle 3 : Convoyage & Gardiennage (Super U -> Concessionnaire Rennes)
  {
    id: 'convoyage-superu-rennes',
    name: 'Convoyage Super U → Concession Rennes',
    category: 'convoyage',
    vehicleType: 'Voiture',
    color: 'convoyage',
    prices: { 1: 35, 2: 35, 3: 35 }
  },
  {
    id: 'gardiennage-transfert',
    name: 'Gardiennage Parc + Livraison Rennes',
    category: 'convoyage',
    vehicleType: 'Voiture',
    color: 'convoyage',
    prices: { 1: 50, 2: 50, 3: 50 }
  },
  {
    id: 'transfert-inter-sites',
    name: 'Transfert Véhicule Concessionnaire',
    category: 'convoyage',
    vehicleType: 'Voiture',
    color: 'convoyage',
    prices: { 1: 40, 2: 40, 3: 40 }
  }
];

const getInitialDemoTransactions = () => {
  const now = new Date();
  const t1 = new Date(now.getTime() - 150 * 60 * 1000).toISOString();
  const t2 = new Date(now.getTime() - 110 * 60 * 1000).toISOString();
  const t3 = new Date(now.getTime() - 75 * 60 * 1000).toISOString();
  const t4 = new Date(now.getTime() - 35 * 60 * 1000).toISOString();

  return [
    {
      id: 'tx-demo-1',
      timestamp: t1,
      deliveredAt: new Date(now.getTime() - 95 * 60 * 1000).toISOString(),
      employeId: 'u2',
      employeName: 'Karim',
      siteId: 1,
      siteName: 'Garage Thorigné-Fouillard',
      activityType: 'garage',
      serviceId: 'lavage-complet-voiture',
      serviceName: 'Lavage Complet Voiture (Int/Ext)',
      vehicleType: 'Voiture',
      clientName: 'Client Atelier Thorigné',
      plateNumber: 'GH-482-TR',
      mileageStart: '',
      mileageEnd: '',
      pickupLocation: 'Garage Thorigné',
      dropoffLocation: 'Garage Thorigné',
      status: 'termine',
      amount: 65,
      paymentMethod: 'Facture Client',
      notes: 'Intérieur cuir + shampoing sièges'
    },
    {
      id: 'tx-demo-2',
      timestamp: t2,
      deliveredAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      employeId: 'u4',
      employeName: 'Mehdi',
      siteId: 1,
      siteName: 'Garage Thorigné-Fouillard',
      activityType: 'garage',
      serviceId: 'lavage-camion-utilitaire',
      serviceName: 'Lavage Camion / Utilitaire',
      vehicleType: 'Camion / Utilitaire',
      clientName: 'Transport Bretagne Pro',
      plateNumber: 'FK-904-BZ',
      mileageStart: '',
      mileageEnd: '',
      pickupLocation: 'Garage Thorigné',
      dropoffLocation: 'Garage Thorigné',
      status: 'termine',
      amount: 95,
      paymentMethod: 'Facture Client',
      notes: 'Fourgon grand volume + caisse'
    },
    {
      id: 'tx-demo-3',
      timestamp: t3,
      deliveredAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      employeId: 'u3',
      employeName: 'Yassine',
      siteId: 3,
      siteName: 'Convoyage & Gardiennage (Super U → Rennes)',
      activityType: 'convoyage',
      serviceId: 'convoyage-superu-rennes',
      serviceName: 'Convoyage Super U → Concession Rennes',
      vehicleType: 'Voiture',
      clientName: 'Concessionnaire Rennes',
      plateNumber: 'GT-219-ML',
      mileageStart: 14250,
      mileageEnd: 14264,
      pickupLocation: 'Parc Super U Thorigné',
      dropoffLocation: 'Concessionnaire Rennes',
      status: 'livre',
      amount: 35,
      paymentMethod: 'Facture Client',
      notes: 'RAS - Livré au responsable parc VN'
    },
    {
      id: 'tx-demo-4',
      timestamp: t4,
      deliveredAt: null,
      employeId: 'u3',
      employeName: 'Yassine',
      siteId: 3,
      siteName: 'Convoyage & Gardiennage (Super U → Rennes)',
      activityType: 'convoyage',
      serviceId: 'gardiennage-transfert',
      serviceName: 'Gardiennage Parc + Livraison Rennes',
      vehicleType: 'Voiture',
      clientName: 'Concessionnaire Rennes',
      plateNumber: 'HC-731-KP',
      mileageStart: 8420,
      mileageEnd: '',
      pickupLocation: 'Parc Super U Thorigné',
      dropoffLocation: 'Concessionnaire Rennes',
      status: 'en_cours',
      amount: 50,
      paymentMethod: 'Facture Client',
      notes: 'Pris en charge sur le parking Super U, en route vers Rennes'
    },
    {
      id: 'tx-demo-5',
      timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      deliveredAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      employeId: 'u2',
      employeName: 'Karim',
      siteId: 2,
      siteName: 'Sur Site • Concessionnaire Rennes',
      activityType: 'concession',
      serviceId: 'prepa-vo-concession',
      serviceName: 'Remise à Neuf Occasion (VO)',
      vehicleType: 'Voiture',
      clientName: 'Concessionnaire Rennes',
      plateNumber: 'FP-558-WA',
      mileageStart: 63400,
      mileageEnd: '',
      pickupLocation: 'Centre Service Concession Rennes',
      dropoffLocation: 'Hall Occasions Rennes',
      status: 'termine',
      amount: 75,
      paymentMethod: 'Facture Client',
      notes: 'Préparation esthétique complète avant mise en parc'
    }
  ];
};

// Format French license plate automatically (e.g. ab123cd -> AB-123-CD)
export const formatLicensePlate = (raw) => {
  if (!raw) return '';
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
  if (/^[A-Z]{2}[0-9]{3}[A-Z]{1,2}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  if (/^[A-Z]{2}[0-9]{1,3}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  }
  return raw.toUpperCase().slice(0, 12);
};

// Compress mobile camera photo into lightweight JPEG base64
export const compressImageFile = (file, maxWidth = 900, quality = 0.72) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const AppProvider = ({ children }) => {
  const [sites, setSites] = useState(() => {
    const saved = localStorage.getItem('ne_sites');
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ne_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('ne_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('ne_transactions');
    return saved ? JSON.parse(saved) : getInitialDemoTransactions();
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ne_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('ne_sites', JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem('ne_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ne_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('ne_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Storage quota warning, trimming older photos if needed', e);
    }
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ne_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (username, password) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const user = users.find(
      u => u.username.toLowerCase() === cleanUser && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Identifiant ou mot de passe incorrect' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- User Management & Affectations ---
  const addUser = (userData) => {
    const id = 'u' + Date.now();
    const assignedSites = userData.assignedSites?.length ? userData.assignedSites.map(Number) : [1, 2, 3];
    const newUser = {
      id,
      username: userData.username.toLowerCase().trim(),
      password: userData.password || '123',
      name: userData.name,
      role: userData.role || 'employe',
      specialty: userData.specialty || 'Polyvalent',
      assignedSites,
      dailySiteId: Number(userData.dailySiteId) || assignedSites[0] || 1,
      dailyMissionNote: userData.dailyMissionNote || ''
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId, userData) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        const updated = {
          ...u,
          ...userData,
          assignedSites: userData.assignedSites?.length ? userData.assignedSites.map(Number) : u.assignedSites,
          dailySiteId: userData.dailySiteId !== undefined ? Number(userData.dailySiteId) : u.dailySiteId,
          password: userData.password ? userData.password : u.password
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      })
    );
  };

  const updateDailyAssignment = (userId, dailySiteId, dailyMissionNote) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        const updated = {
          ...u,
          dailySiteId: Number(dailySiteId),
          dailyMissionNote: dailyMissionNote !== undefined ? dailyMissionNote : u.dailyMissionNote
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      })
    );
  };

  const deleteUser = (userId) => {
    if (confirm('Supprimer ce salarié ?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // --- Site / Pôle Management ---
  const addSite = (siteData) => {
    const id = Date.now();
    const newSite = { id, ...siteData };
    setSites(prev => [...prev, newSite]);
  };

  const updateSite = (siteId, siteData) => {
    setSites(prev => prev.map(s => (s.id === siteId ? { ...s, ...siteData } : s)));
  };

  const deleteSite = (siteId) => {
    if (confirm('Supprimer ce site / pôle d\'activité ?')) {
      setSites(prev => prev.filter(s => s.id !== siteId));
    }
  };

  // --- Service / Prestation Management ---
  const addService = (serviceData) => {
    const id = serviceData.id || serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const defaultPrices = {};
    sites.forEach(s => {
      defaultPrices[s.id] = parseFloat(serviceData.defaultPrice) || 45;
    });
    const newService = {
      ...serviceData,
      id,
      prices: serviceData.prices && Object.keys(serviceData.prices).length ? serviceData.prices : defaultPrices
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (serviceId, serviceData) => {
    setServices(prev => prev.map(s => (s.id === serviceId ? { ...s, ...serviceData } : s)));
  };

  const deleteService = (serviceId) => {
    if (confirm('Supprimer cette prestation ?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
    }
  };

  const updateServicePrice = (serviceId, siteId, newPrice) => {
    const priceVal = newPrice === '' ? 0 : parseFloat(newPrice) || 0;
    setServices(prev =>
      prev.map(s =>
        s.id === serviceId
          ? { ...s, prices: { ...(s.prices || {}), [siteId]: priceVal } }
          : s
      )
    );
  };

  // --- Operations: Lavage Garage, Lavage Concessionnaire & Convoyage ---
  const addIntervention = (payload) => {
    const user = users.find(u => u.id === payload.employeId) || currentUser;
    const service = services.find(s => s.id === payload.serviceId);
    const site = sites.find(s => Number(s.id) === Number(payload.siteId)) || sites[0];

    const prices = service?.prices || {};
    const rawPrice =
      payload.customPrice !== undefined && payload.customPrice !== ''
        ? payload.customPrice
        : prices[site.id] ?? prices[String(site.id)] ?? prices[Object.keys(prices)[0]] ?? 0;
    const amount = parseFloat(rawPrice) || 0;

    const activityType = payload.activityType || service?.category || site?.category || 'garage';
    const isConvoyage = activityType === 'convoyage';

    // Convoyage starts as 'en_cours' (Pris en charge) unless immediately marked delivered
    // Lavage is 'termine' if afterPhoto is provided or if marked completed, or 'en_cours' if waiting for end-of-job photo
    const initialStatus = payload.status || (isConvoyage ? 'en_cours' : 'termine');

    const newTx = {
      id: 'tx-' + Date.now(),
      timestamp: new Date().toISOString(),
      deliveredAt: initialStatus === 'livre' || initialStatus === 'termine' ? new Date().toISOString() : null,
      employeId: user?.id || 'u1',
      employeName: user?.name || 'Employé',
      siteId: Number(site.id),
      siteName: site.name,
      activityType,
      serviceId: service?.id || 'custom',
      serviceName: service?.name || payload.serviceName || 'Prestation',
      vehicleType: payload.vehicleType || service?.vehicleType || 'Voiture',
      clientName: payload.clientName || site.defaultClient || 'Client',
      plateNumber: formatLicensePlate(payload.plateNumber || ''),
      platePhoto: payload.platePhoto || null,
      afterPhoto: payload.afterPhoto || null,
      mileageStart: payload.mileageStart !== undefined && payload.mileageStart !== '' ? Number(payload.mileageStart) : '',
      mileageEnd: payload.mileageEnd !== undefined && payload.mileageEnd !== '' ? Number(payload.mileageEnd) : '',
      pickupLocation: payload.pickupLocation || (isConvoyage ? 'Parc Super U Thorigné' : site.name),
      dropoffLocation: payload.dropoffLocation || (isConvoyage ? 'Concessionnaire Rennes' : site.name),
      status: initialStatus,
      amount,
      paymentMethod: payload.paymentMethod || 'Facture Client',
      notes: payload.notes || ''
    };

    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  // Mark a vehicle as Delivered (Convoyage Super U -> Rennes) or Completed with End-of-Job Photo
  const completeIntervention = (txId, updates = {}) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id !== txId) return t;
        const newStatus = t.activityType === 'convoyage' ? 'livre' : 'termine';
        return {
          ...t,
          ...updates,
          mileageEnd:
            updates.mileageEnd !== undefined && updates.mileageEnd !== ''
              ? Number(updates.mileageEnd)
              : t.mileageEnd,
          afterPhoto: updates.afterPhoto || t.afterPhoto,
          status: newStatus,
          deliveredAt: new Date().toISOString()
        };
      })
    );
  };

  // Cancel an intervention and recalculate revenue automatically
  const cancelTransaction = (transaction) => {
    if (!transaction || transaction.isCancelled) return null;
    const rawAmount = Number(transaction.amount) || 0;
    if (rawAmount <= 0) return null;

    const cancellation = {
      id: 'cancel-' + Date.now(),
      timestamp: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      employeId: transaction.employeId,
      employeName: transaction.employeName,
      siteId: Number(transaction.siteId),
      siteName: transaction.siteName,
      activityType: transaction.activityType,
      serviceId: transaction.serviceId,
      serviceName: transaction.serviceName,
      vehicleType: transaction.vehicleType,
      clientName: transaction.clientName,
      plateNumber: transaction.plateNumber,
      mileageStart: transaction.mileageStart,
      mileageEnd: transaction.mileageEnd,
      pickupLocation: transaction.pickupLocation,
      dropoffLocation: transaction.dropoffLocation,
      status: 'annule',
      amount: -Math.abs(rawAmount),
      paymentMethod: transaction.paymentMethod,
      cancelledTxId: transaction.id,
      notes: `Annulation (${transaction.plateNumber || transaction.serviceName})`
    };

    setTransactions(prev => [cancellation, ...prev]);
    return cancellation;
  };

  const getStats = (filter = 'day', siteFilter = 'all', customRange = null, activityFilter = 'all') => {
    const now = new Date();
    let filtered = transactions;

    // Filter by site
    if (siteFilter && siteFilter !== 'all') {
      filtered = filtered.filter(t => Number(t.siteId) === parseInt(siteFilter, 10));
    } else if (currentUser && currentUser.role === 'employe' && !siteFilter) {
      filtered = filtered.filter(t => t.employeId === currentUser.id);
    }

    // Filter by activity pole ('garage' | 'concession' | 'convoyage')
    if (activityFilter && activityFilter !== 'all') {
      filtered = filtered.filter(t => t.activityType === activityFilter);
    }

    // Filter by time
    if (filter === 'day') {
      filtered = filtered.filter(t => t.timestamp && new Date(t.timestamp).toDateString() === now.toDateString());
    } else if (filter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => t.timestamp && new Date(t.timestamp) >= oneWeekAgo);
    } else if (filter === 'month') {
      filtered = filtered.filter(t => {
        if (!t.timestamp) return false;
        const d = new Date(t.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filter === 'custom' && customRange) {
      const start = new Date(customRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => {
        if (!t.timestamp) return false;
        const d = new Date(t.timestamp);
        return d >= start && d <= end;
      });
    }

    // Pair negative cancellation rows with their original positive transaction
    const annotated = filtered.map(t => ({ ...t, amount: Number(t.amount) || 0, isCancelled: false }));
    const cancellations = annotated.filter(t => t.amount < 0);
    cancellations.forEach(cancelTx => {
      const targetAmount = Math.abs(cancelTx.amount);
      for (let i = annotated.length - 1; i >= 0; i--) {
        const cand = annotated[i];
        if (
          cand.amount > 0 &&
          !cand.isCancelled &&
          (cand.id === cancelTx.cancelledTxId ||
            (Math.abs(cand.amount - targetAmount) < 0.01 &&
              cand.serviceName === cancelTx.serviceName &&
              cand.employeId === cancelTx.employeId &&
              cand.plateNumber === cancelTx.plateNumber))
        ) {
          cand.isCancelled = true;
          break;
        }
      }
    });

    const totalRevenue = parseFloat(annotated.reduce((sum, t) => sum + t.amount, 0).toFixed(2));
    const count = Math.max(
      0,
      annotated.reduce((acc, t) => acc + (t.amount > 0 ? 1 : t.amount < 0 ? -1 : 0), 0)
    );

    const activePositive = annotated.filter(t => t.amount > 0 && !t.isCancelled);
    const inProgressCount = activePositive.filter(t => t.status === 'en_cours').length;
    const completedCount = activePositive.filter(t => t.status === 'livre' || t.status === 'termine').length;

    const byActivity = annotated.reduce((acc, t) => {
      const key = t.activityType || 'garage';
      acc[key] = parseFloat(((acc[key] || 0) + t.amount).toFixed(2));
      return acc;
    }, {});

    const byService = annotated.reduce((acc, t) => {
      const sName = t.serviceName || 'Prestation';
      acc[sName] = parseFloat(((acc[sName] || 0) + t.amount).toFixed(2));
      return acc;
    }, {});

    const byServiceCount = annotated.reduce((acc, t) => {
      const sName = t.serviceName || 'Prestation';
      const delta = t.amount > 0 ? 1 : t.amount < 0 ? -1 : 0;
      acc[sName] = Math.max(0, (acc[sName] || 0) + delta);
      return acc;
    }, {});

    const byUser = annotated.reduce((acc, t) => {
      acc[t.employeId] = parseFloat(((acc[t.employeId] || 0) + t.amount).toFixed(2));
      return acc;
    }, {});

    const byClient = annotated.reduce((acc, t) => {
      const client = t.clientName || 'Client';
      acc[client] = parseFloat(((acc[client] || 0) + t.amount).toFixed(2));
      return acc;
    }, {});

    return {
      totalRevenue,
      count,
      inProgressCount,
      completedCount,
      byActivity,
      byService,
      byServiceCount,
      byUser,
      byClient,
      filtered: annotated,
      activePositive
    };
  };

  // Export CSV for Client Invoice / État des lieux
  const downloadCSV = (data, customFilename = null) => {
    if (!data || data.length === 0) return;

    const headers = [
      'Date',
      'Heure Prise en charge',
      'Heure Livraison/Fin',
      'Pôle / Site',
      'Client',
      'Salarié',
      'Prestation',
      'Véhicule',
      'Immatriculation',
      'Km Départ',
      'Km Arrivée',
      'Trajet / Lieu',
      'Statut',
      'Montant HT (€)'
    ];

    const rows = data.map(t => {
      const d = new Date(t.timestamp);
      const deliv = t.deliveredAt ? new Date(t.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En cours';
      const statusLabel =
        t.amount < 0
          ? 'Annulation'
          : t.isCancelled
          ? 'Annulée'
          : t.status === 'livre'
          ? 'Livré'
          : t.status === 'en_cours'
          ? 'En cours (Pris en charge)'
          : 'Terminé';
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deliv,
        t.siteName || '',
        t.clientName || '',
        t.employeName || '',
        t.serviceName || '',
        t.vehicleType || 'Voiture',
        t.plateNumber || 'N/A',
        t.mileageStart !== '' && t.mileageStart !== undefined ? `${t.mileageStart} km` : '-',
        t.mileageEnd !== '' && t.mileageEnd !== undefined ? `${t.mileageEnd} km` : '-',
        t.activityType === 'convoyage' ? `${t.pickupLocation} -> ${t.dropoffLocation}` : t.siteName,
        statusLabel,
        Number(t.amount).toFixed(2)
      ].join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      customFilename || `Etat_des_Lieux_Nettoyage_Express_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Push Notification Fin de Journée (18h30 / 20h) ---
  const [notifPermission, setNotifPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const [notifEnabled, setNotifEnabled] = useState(() => {
    const saved = localStorage.getItem('ne_notif_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [dailyRecapModal, setDailyRecapModal] = useState(null);

  useEffect(() => {
    localStorage.setItem('ne_notif_enabled', JSON.stringify(notifEnabled));
  }, [notifEnabled]);

  const getDailySiteSummary = () => {
    const siteBreakdown = sites.map(site => {
      const sStats = getStats('day', site.id);
      return {
        id: site.id,
        name: site.name,
        revenue: sStats.totalRevenue,
        count: sStats.count,
        inProgress: sStats.inProgressCount
      };
    });
    const totalStats = getStats('day', 'all');
    return {
      siteBreakdown,
      totalRevenue: totalStats.totalRevenue,
      totalCount: totalStats.count,
      inProgressCount: totalStats.inProgressCount
    };
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifPermission('unsupported');
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') setNotifEnabled(true);
      return perm;
    } catch {
      return Notification.permission;
    }
  };

  const sendDailyRecapNotification = async (isTest = false) => {
    const summary = getDailySiteSummary();
    const lines = summary.siteBreakdown.map(
      s => `📍 ${s.name} : ${s.revenue.toFixed(2)}€ (${s.count} prest.)`
    );
    lines.push(`💰 Total Journée : ${summary.totalRevenue.toFixed(2)}€ (${summary.totalCount} véhicules)`);

    const title = isTest
      ? '🔔 Test Bilan • Nettoyage Express'
      : '🚗 Bilan Fin de Journée • Nettoyage Express';
    const body = lines.join('\n');

    setDailyRecapModal({
      title,
      isTest,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...summary
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      let perm = Notification.permission;
      if (perm === 'default') {
        perm = await requestNotificationPermission();
      }
      if (perm === 'granted') {
        const notifOptions = {
          body,
          icon: '/car-logo.svg',
          badge: '/car-logo.svg',
          tag: isTest ? 'ne-recap-test-' + Date.now() : 'ne-recap-daily',
          vibrate: [200, 100, 200]
        };
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg && reg.showNotification) {
              await reg.showNotification(title, notifOptions);
              return true;
            }
          }
          new Notification(title, notifOptions);
          return true;
        } catch (err) {
          console.error('Notification error:', err);
        }
      }
    }
    return false;
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'patron' || !notifEnabled || sites.length === 0) return;

    const checkAndTrigger = () => {
      const now = new Date();
      const todayKey = now.toDateString();
      const lastSentDate = localStorage.getItem('ne_last_notif_date');

      if (now.getHours() >= 20 && lastSentDate !== todayKey) {
        localStorage.setItem('ne_last_notif_date', todayKey);
        sendDailyRecapNotification(false);
      }
    };

    checkAndTrigger();
    const intervalId = setInterval(checkAndTrigger, 30000);
    return () => clearInterval(intervalId);
  }, [currentUser, notifEnabled, sites, transactions]);

  return (
    <AppContext.Provider
      value={{
        sites,
        users,
        services,
        transactions,
        currentUser,
        setCurrentUser,
        login,
        logout,
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
        addIntervention,
        completeIntervention,
        cancelTransaction,
        getStats,
        downloadCSV,
        notifPermission,
        notifEnabled,
        setNotifEnabled,
        requestNotificationPermission,
        sendDailyRecapNotification,
        dailyRecapModal,
        setDailyRecapModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

