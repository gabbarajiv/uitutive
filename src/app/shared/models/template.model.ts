/**
 * Template Model
 * Defines the structure for response display templates
 */

export interface TemplateRecord {
    id: string;                                    // Unique template ID
    formId: string;                                // Reference to the form
    name: string;                                  // Template display name
    description?: string;                          // Template description
    type: 'default' | 'card' | 'table' | 'custom'; // Template type
    content: string;                               // Template content (HTML/JSON)
    isDefault: boolean;                            // Whether this is the default template
    createdAt: Date;                               // Creation timestamp
    updatedAt: Date;                               // Last update timestamp
    createdBy?: string;                            // User who created the template
    version: number;                               // Template version
}

export interface TemplateVariable {
    name: string;
    displayName: string;
    fieldType: string;
    required?: boolean;
}

export interface DefaultTemplate {
    name: 'Default';
    type: 'default';
    content: {
        layout: 'vertical' | 'horizontal';
        showTimestamp: boolean;
        showStatus: boolean;
        fieldFormatting: Record<string, string>;
    };
}

export interface CardTemplate {
    name: 'Card';
    type: 'card';
    content: {
        cardTitle?: string;
        groupFields?: string[];
        cardsPerRow: number;
    };
}

export interface TableTemplate {
    name: 'Table';
    type: 'table';
    content: {
        columns: Array<{
            field: string;
            header: string;
            width?: string;
            format?: string;
        }>;
        sortable: boolean;
        paginated: boolean;
    };
}

export interface CustomTemplate {
    name: string;
    type: 'custom';
    content: string; // HTML template string
}

export type Template = DefaultTemplate | CardTemplate | TableTemplate | CustomTemplate;
