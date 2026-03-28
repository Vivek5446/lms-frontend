/**
 * Schema-agnostic utilities for the Dynamic Document System.
 * All operations are purely derived from workflow.schema — zero hardcoding.
 */

export interface SchemaField {
  type: string;
  isEditable?: boolean;
  visible?: boolean;
}

export interface SchemaTableColumn {
  name: string;
  type: string;
  isEditable?: boolean;
  visible?: boolean;
}

export interface SchemaTable {
  [tableName: string]: {
    columns: SchemaTableColumn[];
  };
}

/**
 * Returns the list of visible field keys from schema.fields.
 * A field is visible when `visible !== false` (undefined defaults to true).
 */
export function getVisibleFields(
  fields: Record<string, SchemaField>
): { key: string; def: SchemaField }[] {
  return Object.entries(fields)
    .filter(([, def]) => def.visible !== false)
    .map(([key, def]) => ({ key, def }));
}

/**
 * Returns ALL field keys (including hidden) — used to build the submit payload.
 */
export function getAllFields(
  fields: Record<string, SchemaField>
): { key: string; def: SchemaField }[] {
  return Object.entries(fields).map(([key, def]) => ({ key, def }));
}

/**
 * Maps field type to an HTML input type.
 */
export function fieldTypeToInputType(type: string): string {
  switch (type) {
    case "date":      return "date";
    case "number":    return "number";
    case "boolean":   return "checkbox";
    case "email":     return "email";
    default:          return "text";
  }
}

/**
 * Generates dummy data for all fields in schema.fields (including hidden).
 * Keys are preserved exactly as-is — zero hardcoding.
 */
export function generateDummyFields(
  fields: Record<string, SchemaField>
): Record<string, any> {
  const dummy: Record<string, any> = {};
  Object.entries(fields).forEach(([key, def]) => {
    switch (def.type) {
      case "date":    dummy[key] = "2024-01-15"; break;
      case "number":  dummy[key] = 1000; break;
      case "boolean": dummy[key] = true; break;
      default:        dummy[key] = `Sample ${key.replace(/_/g, " ")}`; break;
    }
  });
  return dummy;
}

/**
 * Generates dummy row data for a table's columns.
 */
export function generateDummyTableRow(
  columns: SchemaTableColumn[]
): Record<string, any> {
  const row: Record<string, any> = {};
  columns.forEach((col) => {
    switch (col.type) {
      case "date":   row[col.name] = "2024-01-15"; break;
      case "number": row[col.name] = 100; break;
      default:       row[col.name] = `Sample ${col.name}`;
      break;
    }
  });
  return row;
}

/**
 * Extracts schema safely from a workflow document.
 */
export function extractSchema(workflow: any): {
  fields: Record<string, SchemaField>;
  tables: SchemaTable[];
} {
  return {
    fields: workflow?.schema?.fields || {},
    tables: workflow?.schema?.tables || [],
  };
}

// ── Payload Serialization & Deserialization (originalValue / editedValue) ──

export function parseSavedFieldValues(savedFields: Record<string, any> | undefined, fallback: () => Record<string, any>) {
  if (!savedFields) return fallback();
  const result: Record<string, any> = {};
  for (const key in savedFields) {
    const val = savedFields[key];
    if (val && typeof val === 'object' && 'originalValue' in val) {
      result[key] = val.editedValue !== null ? val.editedValue : val.originalValue;
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function parseSavedOriginalFieldValues(savedFields: Record<string, any> | undefined, fallback: () => Record<string, any>) {
  if (!savedFields) return fallback();
  const result: Record<string, any> = {};
  for (const key in savedFields) {
    const val = savedFields[key];
    if (val && typeof val === 'object' && 'originalValue' in val) {
      result[key] = val.originalValue;
    } else {
      result[key] = val ?? null;
    }
  }
  return result;
}

export function parseSavedTableValues(savedTables: Record<string, any[]> | undefined, fallback: () => Record<string, any[]>) {
  if (!savedTables) return fallback();
  const result: Record<string, any[]> = {};
  for (const tableName in savedTables) {
    result[tableName] = savedTables[tableName].map(row => {
      const parsedRow: Record<string, any> = {};
      for (const col in row) {
        const val = row[col];
        if (val && typeof val === 'object' && 'originalValue' in val) {
          parsedRow[col] = val.editedValue !== null ? val.editedValue : val.originalValue;
        } else {
          parsedRow[col] = val;
        }
      }
      return parsedRow;
    });
  }
  return result;
}

export function parseSavedOriginalTableValues(savedTables: Record<string, any[]> | undefined, fallback: () => Record<string, any[]>) {
  if (!savedTables) return fallback();
  const result: Record<string, any[]> = {};
  for (const tableName in savedTables) {
    result[tableName] = savedTables[tableName].map(row => {
      const parsedRow: Record<string, any> = {};
      for (const col in row) {
        const val = row[col];
        if (val && typeof val === 'object' && 'originalValue' in val) {
          parsedRow[col] = val.originalValue;
        } else {
          parsedRow[col] = val ?? null;
        }
      }
      return parsedRow;
    });
  }
  return result;
}

export function buildFieldPayload(original: Record<string, any>, current: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key in current) {
    const origVal = original[key] ?? null;
    const curVal = current[key];
    result[key] = {
      originalValue: origVal,
      editedValue: curVal !== origVal ? curVal : null,
    };
  }
  return result;
}

export function buildTablePayload(original: Record<string, any[]>, current: Record<string, any[]>) {
  const result: Record<string, any[]> = {};
  for (const tableName in current) {
    const origRows = original[tableName] || [];
    result[tableName] = current[tableName].map((row, idx) => {
      const origRow = origRows[idx] || {};
      const outRow: Record<string, any> = {};
      for (const col in row) {
        const origVal = origRow[col] ?? null;
        const curVal = row[col];
        outRow[col] = {
          originalValue: origVal,
          editedValue: curVal !== origVal ? curVal : null,
        };
      }
      return outRow;
    });
  }
  return result;
}
