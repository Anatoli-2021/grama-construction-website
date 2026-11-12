const UNCONFIRMED = 'We could not confirm that your enquiry was accepted. Your details are still here. Retry without changing them, or call Groma Development.';
const TIMED_OUT = 'The request timed out, so acceptance could not be confirmed. Your details are still here. Retry without changing them, or call Groma Development.';

export function contactPayload(values, { path, topic, lot }) {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    location: values.location,
    timing: values.timing,
    details: values.details,
    consent: values.consent === true,
    website: values.website,
    path,
    interest: topic,
    lot: path === 'home' && topic === 'Dexter Acres' ? lot : '',
  };
}

// Keep one key for an unchanged retry. Editing or starting again invalidates it.
export function createSubmissionSession(makeId = () => globalThis.crypto.randomUUID()) {
  let fingerprint;
  let submissionId;
  return {
    prepare(payload) {
      const nextFingerprint = JSON.stringify(Object.fromEntries(Object.keys(payload).sort().map(key => [key, payload[key]])));
      if (!submissionId || fingerprint !== nextFingerprint) {
        try {
          submissionId = makeId();
        } catch {
          throw new Error('Online submission could not be prepared in this browser. Your details are still here; call Groma Development to discuss your enquiry.');
        }
        fingerprint = nextFingerprint;
      }
      return {
        submissionId,
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submissionId },
        body: JSON.stringify({ ...payload, submissionId }),
      };
    },
    invalidate() {
      fingerprint = undefined;
      submissionId = undefined;
    },
  };
}

export async function checkContactDelivery(fetcher = globalThis.fetch, { timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher('/api/contact/status', { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal });
    const result = await response.json();
    if (!response.ok || typeof result?.enabled !== 'boolean') return { enabled: false, confirmed: false };
    return { enabled: result.enabled === true, confirmed: true };
  } catch {
    return { enabled: false, confirmed: false };
  } finally {
    clearTimeout(timer);
  }
}

export function acceptedReference(response, result) {
  const reference = typeof result?.reference === 'string' ? result.reference.trim() : '';
  if (!response.ok || result?.status !== 'accepted' || !reference || reference.length > 120 || /[\u0000-\u001f\u007f]/.test(reference)) {
    throw new Error(UNCONFIRMED);
  }
  return reference;
}

export async function sendContactSubmission(prepared, fetcher = globalThis.fetch, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher('/api/contact', { method: 'POST', headers: prepared.headers, body: prepared.body, signal: controller.signal });
    const result = await response.json();
    return acceptedReference(response, result);
  } catch {
    throw new Error(controller.signal.aborted ? TIMED_OUT : UNCONFIRMED);
  } finally {
    clearTimeout(timer);
  }
}
