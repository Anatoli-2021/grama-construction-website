export const isLocalPreview = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  && document.querySelector('meta[name="grama-runtime"]')?.content !== 'static-preview';
