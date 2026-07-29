// composables/useToast.ts
export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // Créer un élément toast temporaire
    const toast = document.createElement('div')
    
    // Configuration des couleurs
    const config = {
      success: {
        bg: '#0bc04d',
        text: '#166534',
        border: '#0cf562',
        icon: '✓'
      },
      error: {
        bg: '#e72c2c',
        text: '#991b1b',
        border: '#e72c2c',
        icon: '✕'
      },
      info: {
        bg: '#eff6ff',
        text: '#1e40af',
        border: '#3b82f6',
        icon: 'ℹ'
      }
    }
    
    const current = config[type]
    
    // Structure HTML complète
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; background: ${current.bg}; padding: 3px 4px; border-radius: 12px;">
        <div style="
          flex: 1;
          color: white;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
        ">${message}</div>
        <button style="
          flex-shrink: 0;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        " class="toast-close-btn">✕</button>
      </div>
    `
    
    // Style principal - Appliquer les polices Nuxt
    toast.style.cssText = `
      position: fixed;
      top: 35px;
      right: 20px;
      background: ${current.bg};
      padding: 14px 20px;
      border-radius: 16px;
      z-index: 9999;
      min-width: 280px;
      max-width: 380px;
      cursor: default;
      font-family: 'Plus Jakarta Sans', 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 500;
      animation: slideDown 0.3s ease;
    `
    
    // Ajouter une classe pour mobile
    toast.classList.add('toast-mobile')
    
    // Animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }
      
      .toast-close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      
      @media (max-width: 640px) {
        .toast-mobile {
          top: 10px !important;
          right: 10px !important;
          left: 10px !important;
          min-width: auto !important;
          max-width: none !important;
        }
      }
    `
    document.head.appendChild(style)
    
    document.body.appendChild(toast)
    
    // Fermeture
    const closeBtn = toast.querySelector('.toast-close-btn')
    const closeToast = () => {
      toast.style.animation = 'slideUp 0.3s ease forwards'
      setTimeout(() => {
        toast.remove()
        style.remove()
      }, 400)
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeToast)
    }
    
    // Auto-fermeture
    setTimeout(closeToast, 4000)
  }
  
  return {
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info')
  }
}