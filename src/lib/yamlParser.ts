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
  return yaml.dump(relationship, { noRefs: true, indent: 2 });
}