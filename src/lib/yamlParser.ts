import * as yaml from 'js-yaml';

export function parseObjectsFromYaml(yamlString: string): any[] {
  try {
    const documents = yaml.loadAll(yamlString) as any[];
    return documents.map(doc => doc);
  } catch (error) {
    console.error('Error parsing YAML:', error);
    return [];
  }
}

export function generateRelationshipYaml(relationship: any): string {
  // Transform from the internal format to the required output format
  const formattedRelationship = {
    kind: 'Relationship',
    version: 'v1',
    definition: {
      description: relationship.description || `Relationship from ${relationship.from.object} to ${relationship.to.object}`,
      sourceType: relationship.sourceType || 'object',
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