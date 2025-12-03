/**
 * Database Schema Documentation
 * Defines the structure for backend database tables
 * 
 * Database: SQLite (backend)
 * ORM: TypeORM or Prisma (to be determined)
 */

/* ============================================================ */
/* SUBMISSIONS TABLE */
/* ============================================================ */

/*
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  formId TEXT NOT NULL,
  data JSON NOT NULL,
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'archived')),
  notes TEXT,
  userAgent TEXT,
  ipAddress TEXT,
  sessionId TEXT,
  tags JSON,
  rating INTEGER,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formId) REFERENCES forms(id),
  INDEX idx_formId (formId),
  INDEX idx_status (status),
  INDEX idx_submittedAt (submittedAt),
  INDEX idx_sessionId (sessionId)
);
*/

/* ============================================================ */
/* TEMPLATES TABLE */
/* ============================================================ */

/*
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  formId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('default', 'card', 'table', 'custom')),
  content JSON NOT NULL,
  isDefault BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (formId) REFERENCES forms(id),
  UNIQUE(formId, name),
  INDEX idx_formId (formId),
  INDEX idx_isDefault (isDefault),
  INDEX idx_type (type)
);
*/

/* ============================================================ */
/* FORMS TABLE (Reference) */
/* ============================================================ */

/*
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  schema JSON NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT,
  isActive BOOLEAN NOT NULL DEFAULT TRUE
);
*/

/* ============================================================ */
/* TYPESCRIPT MODELS FOR ORM */
/* ============================================================ */

// For TypeORM
/*
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn
} from 'typeorm';

@Entity('submissions')
@Index(['formId'])
@Index(['status'])
@Index(['submittedAt'])
export class SubmissionEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  formId: string;

  @Column('simple-json')
  data: Record<string, any>;

  @Column('datetime')
  submittedAt: Date;

  @Column('text', { default: 'new' })
  status: 'new' | 'reviewed' | 'archived';

  @Column('text', { nullable: true })
  notes?: string;

  @Column('text', { nullable: true })
  userAgent?: string;

  @Column('text', { nullable: true })
  ipAddress?: string;

  @Column('text', { nullable: true })
  sessionId?: string;

  @Column('simple-json', { nullable: true })
  tags?: string[];

  @Column('integer', { nullable: true })
  rating?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('templates')
@Index(['formId'])
@Index(['isDefault'])
export class TemplateEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  formId: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text')
  type: 'default' | 'card' | 'table' | 'custom';

  @Column('simple-json')
  content: any;

  @Column('boolean', { default: false })
  isDefault: boolean;

  @Column('integer', { default: 1 })
  version: number;

  @Column('text', { nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
*/

/* ============================================================ */
/* MIGRATION SCRIPTS */
/* ============================================================ */

// Initial schema creation
/*
DOWN MIGRATION: Drop all tables
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS forms;

UP MIGRATION: Create all tables
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  schema JSON NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT,
  isActive BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  formId TEXT NOT NULL,
  data JSON NOT NULL,
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'archived')),
  notes TEXT,
  userAgent TEXT,
  ipAddress TEXT,
  sessionId TEXT,
  tags JSON,
  rating INTEGER,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formId) REFERENCES forms(id) ON DELETE CASCADE,
  INDEX idx_formId (formId),
  INDEX idx_status (status),
  INDEX idx_submittedAt (submittedAt),
  INDEX idx_sessionId (sessionId)
);

CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  formId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('default', 'card', 'table', 'custom')),
  content JSON NOT NULL,
  isDefault BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (formId) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE(formId, name),
  INDEX idx_formId (formId),
  INDEX idx_isDefault (isDefault),
  INDEX idx_type (type)
);
*/

export interface DatabaseSchema {
    submissions: {
        tableName: 'submissions';
        fields: [
            'id', 'formId', 'data', 'submittedAt', 'status',
            'notes', 'userAgent', 'ipAddress', 'sessionId', 'tags',
            'rating', 'createdAt', 'updatedAt'
        ];
        indexes: ['formId', 'status', 'submittedAt', 'sessionId'];
        foreignKeys: [{ field: 'formId', references: 'forms.id' }];
    };
    templates: {
        tableName: 'templates';
        fields: [
            'id', 'formId', 'name', 'description', 'type',
            'content', 'isDefault', 'version', 'createdBy',
            'createdAt', 'updatedAt'
        ];
        indexes: ['formId', 'isDefault', 'type'];
        foreignKeys: [{ field: 'formId', references: 'forms.id' }];
        unique: [['formId', 'name']];
    };
}
