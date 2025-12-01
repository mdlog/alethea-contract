/**
 * Base error class for all Oracle SDK errors
 */
export class OracleError extends Error {
    constructor(
        public code: string,
        message: string,
        public cause?: any
    ) {
        super(message);
        this.name = 'OracleError';

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Validation error for invalid parameters
 */
export class ValidationError extends OracleError {
    constructor(message: string) {
        super(
            'VALIDATION_ERROR',
            `Validation failed: ${message}. Please check your input parameters and try again.`
        );
        this.name = 'ValidationError';
    }
}

/**
 * Network error for connection and communication issues
 */
export class NetworkError extends OracleError {
    constructor(message: string, cause?: any) {
        super(
            'NETWORK_ERROR',
            `Network error: ${message}. Please check your connection and endpoint configuration. If the problem persists, the oracle service may be temporarily unavailable.`,
            cause
        );
        this.name = 'NetworkError';
    }
}

/**
 * Error when a market is not found
 */
export class MarketNotFoundError extends OracleError {
    constructor(public marketId: number) {
        super(
            'MARKET_NOT_FOUND',
            `Market with ID ${marketId} was not found. The market may not exist or may have been removed. Please verify the market ID and try again.`
        );
        this.name = 'MarketNotFoundError';
    }
}

/**
 * Error when registration fee is insufficient
 */
export class InsufficientFeeError extends OracleError {
    constructor(
        public required: string,
        public provided: string
    ) {
        super(
            'INSUFFICIENT_FEE',
            `Insufficient registration fee. Required: ${required} tokens, Provided: ${provided} tokens. Please increase the fee and try again. Fee calculation is based on the number of outcomes and time until deadline.`
        );
        this.name = 'InsufficientFeeError';
    }
}

/**
 * Error when maximum retry attempts are exceeded
 */
export class MaxRetriesExceededError extends OracleError {
    constructor(attempts: number, cause?: any) {
        super(
            'MAX_RETRIES_EXCEEDED',
            `Operation failed after ${attempts} retry attempts. The oracle service may be experiencing issues. Please try again later or contact support if the problem persists.`,
            cause
        );
        this.name = 'MaxRetriesExceededError';
    }
}

/**
 * Error when subscription times out
 */
export class SubscriptionTimeoutError extends OracleError {
    constructor(marketId: number, timeoutMs: number) {
        super(
            'SUBSCRIPTION_TIMEOUT',
            `Subscription for market ${marketId} timed out after ${timeoutMs}ms. The market may not have been resolved within the expected timeframe. You can query the market status manually or create a new subscription with a longer timeout.`
        );
        this.name = 'SubscriptionTimeoutError';
    }
}
