/**
 * Integration Models for Third-Party Services
 */

export type IntegrationType =
    | 'crm'           // Salesforce, HubSpot, Pipedrive
    | 'email'         // Mailchimp, ConvertKit, ActiveCampaign
    | 'storage'       // Google Drive, Dropbox, OneDrive
    | 'communication' // Slack, Discord, Teams, Telegram
    | 'analytics'     // Google Analytics, Mixpanel
    | 'custom';       // Custom API

export type CRMProvider = 'salesforce' | 'hubspot' | 'pipedrive';
export type EmailProvider = 'mailchimp' | 'convertkit' | 'activecampaign';
export type StorageProvider = 'google_drive' | 'dropbox' | 'onedrive';
export type CommunicationProvider = 'slack' | 'discord' | 'teams' | 'telegram' | 'sms';

export interface IntegrationConfig {
    id: string;
    formId: string;
    type: IntegrationType;
    provider: string;
    name: string;
    description?: string;
    authMethod: 'oauth' | 'api_key' | 'webhook' | 'basic_auth';
    config: IntegrationSettings;
    isActive: boolean;
    lastSyncAt?: Date;
    syncStatus?: 'idle' | 'syncing' | 'error';
    createdAt: Date;
    updatedAt: Date;
}

export interface IntegrationSettings {
    [key: string]: any;
}

export interface OAuthConfig extends IntegrationSettings {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
}

export interface APIKeyConfig extends IntegrationSettings {
    apiKey: string;
    apiSecret?: string;
    endpoint?: string;
}

export interface WebhookConfig extends IntegrationSettings {
    webhookUrl: string;
    webhookSecret: string;
    events: string[];
}

export interface CRMIntegrationConfig extends IntegrationConfig {
    type: 'crm';
    provider: CRMProvider;
    config: CRMSettings;
}

export interface CRMSettings extends IntegrationSettings {
    fieldMapping: {
        formField: string;
        crmField: string;
    }[];
    autoCreateLeads: boolean;
    autoCreateDeals: boolean;
    dealPipeline?: string;
    leadScore?: string;
}

export interface EmailIntegrationConfig extends IntegrationConfig {
    type: 'email';
    provider: EmailProvider;
    config: EmailSettings;
}

export interface EmailSettings extends IntegrationSettings {
    listId: string;
    doubleOptIn: boolean;
    tags?: string[];
    autoResponder?: string;
    fieldMapping: {
        formField: string;
        emailField: string;
    }[];
}

export interface StorageIntegrationConfig extends IntegrationConfig {
    type: 'storage';
    provider: StorageProvider;
    config: StorageSettings;
}

export interface StorageSettings extends IntegrationSettings {
    folderId?: string;
    autoUpload: boolean;
    fileFormat: 'csv' | 'json' | 'excel';
    folderStructure?: 'flat' | 'by_form' | 'by_date';
}

export interface CommunicationIntegrationConfig extends IntegrationConfig {
    type: 'communication';
    provider: CommunicationProvider;
    config: CommunicationSettings;
}

export interface CommunicationSettings extends IntegrationSettings {
    channel?: string;
    webhookUrl?: string;
    messageTemplate?: string;
    mentionOnNewSubmission?: boolean;
    dailyDigest?: boolean;
}

export interface IntegrationData {
    integrationId: string;
    submissionId: string;
    formId: string;
    status: 'pending' | 'synced' | 'failed';
    externalId?: string;
    error?: string;
    syncedAt?: Date;
    nextRetryAt?: Date;
}

export interface IntegrationSyncLog {
    id: string;
    integrationId: string;
    startedAt: Date;
    completedAt?: Date;
    status: 'pending' | 'completed' | 'failed';
    itemsProcessed: number;
    itemsFailed: number;
    error?: string;
}

export interface IntegrationMarketplaceItem {
    id: string;
    name: string;
    description: string;
    provider: string;
    category: IntegrationType;
    icon?: string;
    documentation?: string;
    ratingAverage?: number;
    installCount?: number;
    isPremium?: boolean;
}

export interface InstallIntegrationRequest {
    type: IntegrationType;
    provider: string;
    formId: string;
    config: IntegrationSettings;
}

export interface UninstallIntegrationRequest {
    integrationId: string;
    cleanupData?: boolean;
}
