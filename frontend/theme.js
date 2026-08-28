window.CareerlyTheme = (function() {
  const themeColors = {
    light: {
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#1f2937',
      primary: '#2563eb',
      secondary: '#10b981',
      border: '#e5e7eb'
    },
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      primary: '#3b82f6',
      secondary: '#10b981',
      border: '#334155'
    }
  };

  function getTheme() {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyVariables(theme) {
    const colors = themeColors[theme];
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.setProperty('--color-background', colors.background);
    document.documentElement.style.setProperty('--color-surface', colors.surface);
    document.documentElement.style.setProperty('--color-text', colors.text);
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    document.documentElement.style.setProperty('--color-border', colors.border);
  }

  // Initialize immediately to prevent theme flash
  applyVariables(getTheme());

  return {
    themeColors,
    getTheme,
    applyVariables
  };
})();
