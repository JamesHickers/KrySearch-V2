const NEXTDNS_DOH_URL = 'https://dns.nextdns.io/ee2162/query';
const domainCache = new Map();

export async function nextDNSCheck(domain) {
  if (domainCache.has(domain)) return domainCache.get(domain);

  try {
    const res = await fetch(`${NEXTDNS_DOH_URL}?name=${domain}&type=A`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      domainCache.set(domain, false);
      return false;
    }

    const data = await res.arrayBuffer();
    const blocked = data.byteLength === 0;

    domainCache.set(domain, blocked);
    return blocked;
  } catch {
    domainCache.set(domain, false);
    return false;
  }
}
