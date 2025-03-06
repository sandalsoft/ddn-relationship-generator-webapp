export interface Field {
  name: string;
  type: string;
}

export interface ObjectDefinition {
  name: string;
  fields: Field[];
}

export interface ObjectType {
  kind: string;
  version: string;
  definition: ObjectDefinition;
}

export interface RelationshipTarget {
  model: {
    name: string;
    relationshipType: string;
  };
}

export interface RelationshipMapping {
  source: {
    fieldPath: { fieldName: string; }[];
  };
  target: {
    modelField: { fieldName: string; }[];
  };
}

export interface Relationship {
  id?: string;
  from: {
    object: string;
    field: string;
  };
  to: {
    object: string;
    field: string;
  };
  type: string;
  description?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface ConnectionPoint {
  object: ObjectType;
  field: string;
  x: number;
  y: number;
  distance?: number; // Optional for distance calculations during snapping
}

// Helper type for relationship detection
export interface RelationshipCheck {
  from: {
    object: string;
    field: string;
  };
  to: {
    object: string;
    field: string;
  };
}

