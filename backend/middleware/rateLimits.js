import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { bump, nextUtcMidnight, unbump, windowEnd } from '../utils/counters.js';

/**
 * Every limit the API enforces, in one place. Counts live in MongoDB (see models/Counter.js),
 * so they hold across Vercel's server instances, which each keep their own memory. If the
 * database can't be reached, requests go through rather than fail.
 *
 * A test backend can turn them off with RATE_LIMITS=off; Vercel never does.
 */
const enabled = process.env.VERCEL || process.env.RATE_LIMITS !== 'off';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const TOO_MANY = 'Too many requests. Please try again in a minute.';

/** express-rate-limit's store, counting in fixed windows in MongoDB. */
class MongoStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  key(key) {
    return `limit:${this.prefix}:${key}:${Math.floor(Date.now() / this.windowMs)}`;
  }

  async increment(key) {
    const resetTime = windowEnd(this.windowMs);
    return { totalHits: await bump(this.key(key), resetTime), resetTime };
  }

  async decrement(key) {
    await unbump(this.key(key));
  }

  async resetKey(key) {
    await unbump(this.key(key));
  }
}

/** Signed-in requests count per account; the rest per address. */
const byAccountOrAddress = (req) => (req.user ? `user:${req.user._id}` : ipKeyGenerator(req.ip));

function limit(name, { windowMs, max, message = TOO_MANY, ...options }) {
  return rateLimit({
    windowMs,
    limit: max,
    store: new MongoStore(name),
    keyGenerator: byAccountOrAddress,
    message: { message },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    passOnStoreError: true,
    skip: () => !enabled,
    ...options,
  });
}

/** Everything under /api: generous, it only stops floods. */
export const apiLimiter = limit('api', { windowMs: MINUTE, max: 300 });

/** Failed log-ins only, so guessing passwords stops but signing in normally never does. */
export const logInLimiter = limit('login', {
  windowMs: 15 * MINUTE,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'Too many tries. Wait 15 minutes, or reset your password.',
});

export const signUpLimiter = limit('signup', { windowMs: HOUR, max: 10, message: 'Too many new accounts from here. Try again in an hour.' });

/** Reset emails are cheap to request and costly to receive. */
export const forgotPasswordLimiter = limit('forgot', { windowMs: 15 * MINUTE, max: 5 });

/** Food search and barcodes call USDA and Open Food Facts, which limit us in turn. */
export const foodLookupLimiter = limit('food', { windowMs: MINUTE, max: 60 });

export const photoLimiter = limit('photo', { windowMs: HOUR, max: 10, message: 'Too many photo changes. Try again in an hour.' });

export const contactLimiter = limit('contact', { windowMs: HOUR, max: 3, message: 'Thanks, we have your messages. Try again in an hour.' });

/** AI calls in a burst; the daily allowance below is the real limit. */
export const aiBurstLimiter = limit('ai', { windowMs: MINUTE, max: 20 });

/** What each account may ask the AI for in a day. A subscription would raise these. */
export const DAILY_ALLOWANCE = {
  coach: { limit: 30, noun: 'coach messages' },
  estimate: { limit: 15, noun: 'meal estimates' },
};

/**
 * The daily allowance for one kind of AI request, per account (per address for guests),
 * reset at midnight UTC. A successful JSON answer carries `allowance: { limit, left }`, so
 * the apps can say when it is running low.
 */
export function dailyAllowance(kind) {
  const { limit: max, noun } = DAILY_ALLOWANCE[kind];
  return async (req, res, next) => {
    if (!enabled) return next();
    let used;
    try {
      const day = new Date().toISOString().slice(0, 10);
      used = await bump(`allowance:${kind}:${byAccountOrAddress(req)}:${day}`, nextUtcMidnight());
    } catch (error) {
      console.error('Daily allowance error:', error.message);
      return next();
    }
    if (used > max) {
      return res.status(429).json({ message: `You've used today's ${max} ${noun}. They come back tomorrow.`, allowance: { limit: max, left: 0 } });
    }
    const json = res.json.bind(res);
    res.json = (body) => json(
      res.statusCode < 400 && body && typeof body === 'object' && !Array.isArray(body)
        ? { ...body, allowance: { limit: max, left: max - used } }
        : body
    );
    return next();
  };
}
