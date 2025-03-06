export interface Field {
  name: string;
  type: string;
}

export interface ObjectDefinition {
  kind: string;
  version: string;
  definition: {
    name: string;
    fields: Field[];
  };
}

export interface Relationship {
  kind: string;
  version: string;
  definition: {
    name: string;
    sourceType: string;
    target: {
      model: {
        name: string;
        relationshipType: string;
      };
    };
    mapping: {
      source: { fieldPath: { fieldName: string; }[]; };
      target: { modelField: { fieldName: string; }[]; };
    }[];
  };
}

export interface Position {
  x: number;
  y: number;
}

// Add this to existing types
export interface ConnectionPoint {
  object: ObjectDefinition;
  field: string;
  x: number;
  y: number;
}

export interface ConnectionPoint {
  object: ObjectDefinition;
  field: string;
  x: number;
  y: number;
  distance?: number; // Make distance optional since it's only used temporarily in snapping
}

export interface ConnectionPoint {
  object: ObjectDefinition;
  field: string;
  x: number;
  y: number;
}

export interface ObjectDefinition {
  definition: {
    name: string;
    fields: Field[];
  };
}

export interface Field {
  name: string;
  type: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface ConnectionPoint {
  object: ObjectDefinition;
  field: string;
  x: number;
  y: number;
}

