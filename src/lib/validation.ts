import type { ObjectDefinition } from './types';

export const validateRelationship = (
  source: ObjectDefinition,
  target: ObjectDefinition
): { isValid: boolean; commonField?: string; error?: string; } => {
  const sourceFields = new Map(source.definition.fields.map(f => [f.name, f.type]));
  const targetFields = new Map(target.definition.fields.map(f => [f.name, f.type]));

  // Check for common fields
  for (const [sourceField, sourceType] of sourceFields) {
    if (targetFields.has(sourceField)) {
      const targetType = targetFields.get(sourceField)!;
      const cleanSourceType = sourceType.replace('!', '');
      const cleanTargetType = targetType.replace('!', '');

      if (cleanSourceType === cleanTargetType) {
        return { isValid: true, commonField: sourceField };
      } else {
        return {
          isValid: false,
          error: `Type mismatch: ${sourceField} has types ${sourceType} and ${targetType}`
        };
      }
    }
  }

  return { isValid: false, error: 'No common fields found between objects' };
};