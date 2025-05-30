import * as yaml from 'js-yaml';
import type { ObjectType, Relationship } from './types';

export function parseObjectsFromYaml(yamlString: string): ObjectType[] {
  if (!yamlString || yamlString.trim() === '') {
    console.log('Empty YAML input provided');
    return [];
  }

  try {
    // Load all documents from the YAML string
    const documents = yaml.loadAll(yamlString) as any[];
    console.log(`Parsed ${documents.length} YAML documents`);

    // Filter for only ObjectType kinds with valid structure
    const objectTypes = documents.filter(doc =>
      doc &&
      doc.kind === 'ObjectType' &&
      doc.definition &&
      doc.definition.name &&
      Array.isArray(doc.definition.fields)
    );

    console.log(`Found ${objectTypes.length} valid ObjectType definitions`);

    if (objectTypes.length === 0 && documents.length > 0) {
      console.warn('No valid ObjectType definitions found in the provided YAML');
    }

    return objectTypes;
  } catch (error) {
    console.error('Error parsing YAML:', error);
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Filters the input YAML string to include only objects with kind: ObjectType
 * and formats them back to YAML with document separators.
 */
export function filterObjectTypeYaml(yamlString: string): string {
  if (!yamlString || yamlString.trim() === '') {
    return '';
  }

  try {
    // Parse the YAML content
    const documents = yaml.loadAll(yamlString) as any[];

    // Filter for only ObjectType kinds
    const objectTypes = documents.filter(doc =>
      doc &&
      doc.kind === 'ObjectType' &&
      doc.definition &&
      doc.definition.name &&
      Array.isArray(doc.definition.fields)
    );

    if (objectTypes.length === 0) {
      return ''; // No ObjectType documents found
    }

    // Convert the filtered objects back to YAML with document separators
    return objectTypes.map(obj =>
      yaml.dump(obj, {
        noRefs: true,
        indent: 2,
        lineWidth: -1,
        flowLevel: -1
      })
    ).join('---\n');
  } catch (error) {
    console.error('Error filtering YAML:', error);
    return yamlString; // Return original on error
  }
}

export function generateRelationshipYaml(relationship: any): string {
  // Transform from the internal format to the required output format
  const formattedRelationship = {
    kind: 'Relationship',
    version: 'v1',
    definition: {
      description: relationship.description || `Relationship from ${relationship.from.object} to ${relationship.to.object}`,
      sourceType: relationship.from.object, // Use source object name as sourceType
      target: {
        model: {
          name: relationship.to.object,
          relationshipType: relationship.type
        }
      },
      mapping: [
        {
          source: {
            fieldPath: [
              { fieldName: relationship.from.field }
            ]
          },
          target: {
            modelField: [
              { fieldName: relationship.to.field }
            ]
          }
        }
      ]
    }
  };

  // Add the document separator and use block style for better readability
  return '---\n' + yaml.dump(formattedRelationship, {
    noRefs: true,
    indent: 2,
    lineWidth: -1, // Prevent line wrapping
    flowLevel: -1 // Use block style for all objects
  });
}