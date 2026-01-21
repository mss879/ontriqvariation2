/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Note: This state is ephemeral in serverless environments.
 */

interface RateLimitConfig {
    interval: number; // Interval in milliseconds
    uniqueTokenPerInterval: number; // Max number of unique tokens (IPs) per interval
}

export function rateLimit(options: RateLimitConfig) {
    const tokenCache = new Map<string, number[]>();

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();
                const windowStart = now - options.interval;

                const timestamps = tokenCache.get(token) || [];

                // Filter out timestamps outside the current window
                const validTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);

                if (validTimestamps.length >= limit) {
                    reject('Rate limit exceeded');
                } else {
                    validTimestamps.push(now);
                    tokenCache.set(token, validTimestamps);

                    // Cleanup old entries if cache gets too big
                    if (tokenCache.size > options.uniqueTokenPerInterval) {
                        // clear oldest 10%
                        const keysToDelete = Array.from(tokenCache.keys()).slice(0, Math.ceil(tokenCache.size * 0.1));
                        keysToDelete.forEach(k => tokenCache.delete(k));
                    }

                    resolve();
                }
            }),
    };
}
