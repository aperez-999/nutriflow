import rateLimit from 'express-rate-limit';

const TOO_MANY = { message: 'Too many requests. Please try again in a minute.' };

/** AI chat calls a paid model, so each client gets 20 a minute. */
export const aiChatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: TOO_MANY });

/** Reset emails are cheap to request and costly to receive, so 5 a minute. */
export const forgotPasswordLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: TOO_MANY });
