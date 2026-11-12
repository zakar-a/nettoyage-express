import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, MoreVertical, X, CheckCircle2 } from 'lucide-react';

// Capture beforeinstallprompt globally in case it fires before component mounts
let globalDeferredPrompt = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

const InstallPwaBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowGuideModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleShareLink = async () => {
    const shareData = {
      title: 'Nettoyage Express • Application Mobile',
      text: "Téléchargez l'application mobile Nettoyage Express sur votre téléphone :",
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled share
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div
        className="no-print"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(16, 185, 129, 0.14))',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '14px',
          padding: '10px 12px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          boxShadow: '0 6px 20px rgba(14, 165, 233, 0.18)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(14, 165, 233, 0.25)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Smartphone size={19} color="#38bdf8" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
              Application Mobile disponible
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Installer sur l&apos;écran d&apos;accueil du téléphone
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.76rem',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
            }}
          >
            <Download size={14} />
            Installer
          </button>

          <button
            type="button"
            onClick={handleShareLink}
            title="Partager le lien à un salarié"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'white',
              padding: '8px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {copied ? <CheckCircle2 size={15} color="#10b981" /> : <Share2 size={15} />}
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            title="Masquer"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Modal Guide Installation Mobile (iPhone Safari & Android) */}
      {showGuideModal && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 4000,
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
              maxWidth: '400px',
              padding: '1.4rem',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
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
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <img
                src="/pwa-192x192.png"
                alt="Nettoyage Express"
                style={{ width: '46px', height: '46px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.4)' }}
              />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Application Téléphone
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Installer Nettoyage Express</h3>
              </div>
            </div>

            {isIOS ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Sur <b style={{ color: 'white' }}>iPhone / iPad (Safari)</b>, suivez ces 2 étapes :
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}
                >
                  <Share2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span>
                    1. Appuyez sur le bouton <b>Partager</b> en bas de votre navigateur Safari.
                  </span>
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}
                >
                  <PlusSquare size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>
                    2. Faites défiler et appuyez sur <b>« Sur l&apos;écran d&apos;accueil »</b> puis <b>Ajouter</b>.
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Pour installer l&apos;application sur votre téléphone :
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}
                >
                  <MoreVertical size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span>
                    1. Sur <b>Android (Chrome)</b> : appuyez sur le menu <b>⋮</b> en haut à droite puis sur <b>« Installer l&apos;application »</b>.
                  </span>
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.84rem'
                  }}
                >
                  <PlusSquare size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>
                    2. Sur <b>iPhone (Safari)</b> : appuyez sur <b>Partager</b> en bas puis sur <b>« Sur l&apos;écran d&apos;accueil »</b>.
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowGuideModal(false)}
              style={{ width: '100%', padding: '11px' }}
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPwaBanner;

