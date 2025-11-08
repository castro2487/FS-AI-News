import crypto from 'crypto';

export function generateCacheKey(data: Record<string, any>): string {
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {});
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(sortedData))
    .digest('hex');
}