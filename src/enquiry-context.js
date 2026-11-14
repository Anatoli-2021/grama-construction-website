const allowedTopics = {
  home: ['Dexter Acres', 'Custom home'],
  development: ['Landowner opportunity', 'Investment partnership', 'Development partnership'],
};

export function readEnquiryContext(search = '') {
  const params = new URLSearchParams(search);
  const path = params.get('path');
  if (!Object.hasOwn(allowedTopics, path)) return null;
  const topic = allowedTopics[path].includes(params.get('topic')) ? params.get('topic') : allowedTopics[path][0];
  const lot = params.get('lot');
  return { path, topic, ...(path === 'home' && topic === 'Dexter Acres' && /^([1-9]|1[0-4])$/.test(lot || '') ? { lot } : {}) };
}
export function enquiryHref(options = {}) {
  const params = new URLSearchParams({ path: options.path || 'development', topic: options.topic || 'Development partnership' });
  if (options.lot) params.set('lot', String(options.lot));
  const context = readEnquiryContext(params.toString());
  return '/contact' + (context ? '?' + new URLSearchParams(context).toString() : '');
}
