// This is a visitor-controlled email handoff, not a server submission.
export function publicContactEmail(value) {
  if (typeof value !== 'string') return '';
  const address = value.trim();
  return address.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(address) ? address : '';
}

export function contactEmailLink(destination, enquiry) {
  const address = publicContactEmail(destination);
  if (!address) return '';
  const { name = '', email = '', phone = '', interest = '', lot = '', location = '', timing = '', details = '' } = enquiry;
  const selectedLot = interest === 'Dexter Acres' && /^(?:[1-9]|1[0-4])$/.test(String(lot)) ? String(lot) : '';
  const topic = ['Dexter Acres', 'Custom home', 'Landowner opportunity', 'Investment partnership', 'Development partnership'].includes(interest) ? interest : 'Project enquiry';
  const body = [
    'Hello Grama Development,', '',
    'I would like to discuss ' + topic.toLowerCase() + '.', '',
    'Name: ' + name, 'Email: ' + email,
    ...(phone ? ['Phone: ' + phone] : []),
    'Interest: ' + topic,
    ...(selectedLot ? ['Dexter Acres lot: ' + selectedLot] : []),
    ...(location ? ['Location: ' + location] : []),
    ...(timing ? ['Timeframe: ' + timing] : []),
    ...(details ? ['', 'Project details:', details] : []),
  ].join('\n').replace(/\r\n?|\n/g, '\r\n');
  return 'mailto:' + encodeURIComponent(address).replace(/%40/g, '@') + '?subject=' + encodeURIComponent('GRAMA — ' + topic) + '&body=' + encodeURIComponent(body);
}
