const formHost = 'app.smartsheet.com';
const leadTypes = new Set(['General Contact', 'Dexter Acres', 'Grama Kitchens']);

export function buildIntakeUrl(formUrl, leadType, lot) {
  if (!formUrl || !leadTypes.has(leadType)) return '';
  let url;
  try {
    url = new URL(formUrl);
  } catch {
    return '';
  }
  if (url.origin !== 'https://' + formHost || url.username || url.password ||
      url.search || url.hash || !/^\/b\/form\/[a-f0-9]{32}\/?$/i.test(url.pathname)) return '';
  const fields = [['Lead type', leadType]];
  if (leadType === 'Dexter Acres' && /^([1-9]|1[0-4])$/.test(String(lot ?? ''))) {
    fields.push(['Dexter lot', String(lot)]);
  }
  return url.href + '?' + fields.map(([key, value]) =>
    encodeURIComponent(key) + '=' + encodeURIComponent(value)
  ).join('&');
}

export function websiteIntakeUrl(leadType, lot) {
  return buildIntakeUrl(import.meta.env?.VITE_SMARTSHEET_ENQUIRY_URL, leadType, lot);
}
