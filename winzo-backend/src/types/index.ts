/**
 * Type Definitions for Winzo Sports Betting Platform
 * 
 * Centralized TypeScript type definitions for the entire backend application.
 * These types ensure type safety and consistency across all modules.
 */

import { Request } from 'express';

/**
 * User-related types
 */
export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    salt: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

export interface UserProfile {
    userId: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    phone?: string;
    countryCode: string;
    timezone: string;
    languageCode: string;
    currencyCode: string;
    verificationStatus: VerificationStatus;
    verificationDocuments?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPreferences {
    userId: string;
    oddsFormat: OddsFormat;
    notifications: NotificationSettings;
    bettingLimits: BettingLimits;
    responsibleGaming: ResponsibleGamingSettings;
    uiPreferences: UIPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserBalance {
    userId: string;
    balance: number;
    bonusBalance: number;
    pendingBalance: number;
    currencyCode: string;
    lastUpdated: Date;
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    SUPPORT = 'support'
}

export enum UserStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
    PENDING = 'pending'
}

export enum VerificationStatus {
    UNVERIFIED = 'unverified',
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected'
}

export enum OddsFormat {
    AMERICAN = 'american',
    DECIMAL = 'decimal',
    FRACTIONAL = 'fractional'
}

export interface NotificationSettings {
    email: boolean;
    sms: boolean;
    push: boolean;
    betResults: boolean;
    promotions: boolean;
}

export interface BettingLimits {
    daily: number;
    weekly: number;
    monthly: number;
}

export interface ResponsibleGamingSettings {
    sessionTimeout: number;
    realityCheck: boolean;
}

export interface UIPreferences {
    theme: 'light' | 'dark';
    language: string;
}

/**
 * Authentication types
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface JWTPayload {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
    permissions: string[];
    iat: number;
    exp: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    countryCode: string;
    inviteCode?: string;
}

/**
 * Sports data types
 */
export interface Sport {
    id: string;
    name: string;
    displayName: string;
    slug: string;
    iconUrl?: string;
    isActive: boolean;
    sortOrder: number;
    configuration: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface League {
    id: string;
    sportId: string;
    name: string;
    displayName: string;
    slug: string;
    countryCode?: string;
    season?: string;
    isActive: boolean;
    sortOrder: number;
    configuration: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Team {
    id: string;
    sportId: string;
    leagueId?: string;
    name: string;
    displayName: string;
    abbreviation?: string;
    slug: string;
    logoUrl?: string;
    city?: string;
    conference?: string;
    division?: string;
    foundedYear?: number;
    isActive: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Event {
    id: string;
    sportId: string;
    leagueId?: string;
    homeTeamId: string;
    awayTeamId: string;
    startTime: Date;
    status: EventStatus;
    period?: string;
    clock?: string;
    homeScore: number;
    awayScore: number;
    venue?: string;
    weatherConditions?: Record<string, any>;
    officials?: Record<string, any>;
    statistics?: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export enum EventStatus {
    SCHEDULED = 'scheduled',
    LIVE = 'live',
    HALFTIME = 'halftime',
    FINISHED = 'finished',
    POSTPONED = 'postponed',
    CANCELLED = 'cancelled',
    SUSPENDED = 'suspended'
}

/**
 * Betting types
 */
export interface Market {
    id: string;
    eventId: string;
    type: MarketType;
    name: string;
    description?: string;
    handicap?: number;
    totalPoints?: number;
    isActive: boolean;
    status: MarketStatus;
    rules: Record<string, any>;
    settlementRules: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    settledAt?: Date;
}

export interface Selection {
    id: string;
    marketId: string;
    name: string;
    shortName?: string;
    odds: number;
    probability?: number;
    isActive: boolean;
    result?: SelectionResult;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Bet {
    id: string;
    userId: string;
    type: BetType;
    status: BetStatus;
    stake: number;
    totalOdds: number;
    potentialWin: number;
    actualWin: number;
    currencyCode: string;
    placedAt: Date;
    settledAt?: Date;
    voidReason?: string;
    metadata: Record<string, any>;
}

export interface BetSelection {
    id: string;
    betId: string;
    selectionId: string;
    odds: number;
    result?: SelectionResult;
    settledAt?: Date;
}

export enum MarketType {
    MONEYLINE = 'moneyline',
    POINT_SPREAD = 'point_spread',
    TOTAL_POINTS = 'total_points',
    FIRST_HALF = 'first_half',
    PROP_BET = 'prop_bet',
    FUTURES = 'futures'
}

export enum MarketStatus {
    OPEN = 'open',
    SUSPENDED = 'suspended',
    CLOSED = 'closed',
    SETTLED = 'settled',
    VOIDED = 'voided'
}

export enum BetType {
    SINGLE = 'single',
    PARLAY = 'parlay',
    SYSTEM = 'system'
}

export enum BetStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    SETTLED_WIN = 'settled_win',
    SETTLED_LOSS = 'settled_loss',
    SETTLED_PUSH = 'settled_push',
    CANCELLED = 'cancelled',
    VOIDED = 'voided'
}

export enum SelectionResult {
    WIN = 'win',
    LOSS = 'loss',
    PUSH = 'push',
    VOID = 'void'
}

export interface BetPlacementRequest {
    selections: BetSelectionRequest[];
    stake: number;
    betType: BetType;
    acceptOddsChanges?: boolean;
}

export interface BetSelectionRequest {
    marketId: string;
    selectionId: string;
    odds: number;
}

/**
 * Financial types
 */
export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    currencyCode: string;
    status: TransactionStatus;
    reference?: string;
    externalReference?: string;
    description?: string;
    paymentMethodId?: string;
    relatedBetId?: string;
    processorResponse?: Record<string, any>;
    fees: number;
    netAmount: number;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentMethod {
    id: string;
    userId: string;
    type: PaymentMethodType;
    name: string;
    details: Record<string, any>;
    isDefault: boolean;
    isActive: boolean;
    lastUsedAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    BET_DEBIT = 'bet_debit',
    BET_CREDIT = 'bet_credit',
    BONUS = 'bonus',
    ADJUSTMENT = 'adjustment',
    FEE = 'fee',
    REFUND = 'refund'
}

export enum TransactionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REVERSED = 'reversed'
}

export enum PaymentMethodType {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    E_WALLET = 'e_wallet',
    CRYPTOCURRENCY = 'cryptocurrency'
}

/**
 * API Response types
 */
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: APIError;
    pagination?: PaginationInfo;
    meta?: ResponseMeta;
}

export interface APIError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ResponseMeta {
    version: string;
    timestamp: string;
    requestId: string;
}

/**
 * WebSocket types
 */
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
    userId?: string;
}

export interface OddsUpdate {
    marketId: string;
    eventId: string;
    selections: {
        selectionId: string;
        odds: number;
        lastUpdated: string;
    }[];
}

export interface EventUpdate {
    eventId: string;
    status: EventStatus;
    score?: {
        home: number;
        away: number;
    };
    clock?: string;
    lastUpdated: string;
}

export interface BetConfirmation {
    betId: string;
    status: BetStatus;
    totalStake: number;
    potentialWin: number;
    confirmationNumber: string;
}

export interface BetSettlement {
    betId: string;
    result: BetStatus;
    actualWin: number;
    settledAt: string;
}

/**
 * Express Request extensions
 */
export interface AuthenticatedRequest extends Request {
    user?: User;
    userId?: string;
    jwtPayload?: JWTPayload;
}

/**
 * Query parameter types
 */
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface EventQuery extends PaginationQuery {
    sportId?: string;
    leagueId?: string;
    status?: EventStatus;
    startDate?: string;
    endDate?: string;
}

export interface BetQuery extends PaginationQuery {
    status?: BetStatus;
    type?: BetType;
    startDate?: string;
    endDate?: string;
}

/**
 * Audit and logging types
 */
export interface AuditLog {
    id: string;
    tableName: string;
    recordId: string;
    action: AuditAction;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

export interface SystemEvent {
    id: string;
    eventType: string;
    severity: EventSeverity;
    message: string;
    details?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    createdAt: Date;
}

export enum AuditAction {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export enum EventSeverity {
    DEBUG = 'debug',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

/**
 * Configuration types
 */
export interface DatabaseConfig {
    url: string;
    poolMin: number;
    poolMax: number;
}

export interface RedisConfig {
    url: string;
    password?: string;
    db: number;
}

export interface JWTConfig {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}

/**
 * Service types
 */
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface SMSOptions {
    to: string;
    message: string;
}

export interface NotificationOptions {
    userId: string;
    type: 'email' | 'sms' | 'push';
    template: string;
    data: Record<string, any>;
}

/**
 * External API types
 */
export interface SportsDataResponse {
    success: boolean;
    data: any;
    timestamp: string;
    source: string;
}

export interface PaymentProcessorResponse {
    success: boolean;
    transactionId: string;
    status: string;
    amount: number;
    currency: string;
    processorData: Record<string, any>;
}

/**
 * Validation types
 */
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Cache types
 */
export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    tags: string[];
}

/**
 * Health check types
 */
export interface HealthCheck {
    service: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    details?: Record<string, any>;
    timestamp: string;
}

export interface SystemHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    services: HealthCheck[];
    uptime: number;
    timestamp: string;
    version: string;
}

