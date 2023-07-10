import { nodeShapeToJSONSchema } from '../../src/SHACLToJSONSchema';
import { NodeShape } from '../../src/Types';
import { SHACL } from '../../src/Vocabulary';

describe('Converting SHACL to JSONSChema.', (): void => {
  it('throws an error if an unsupported shacl:path is used.', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': {
        'http://www.w3.org/ns/shacl#datatype': {
          '@id': 'http://www.w3.org/2001/XMLSchema#string'
        },
        'http://www.w3.org/ns/shacl#maxCount': {
          '@value': 1,
          '@type': 'http://www.w3.org/2001/XMLSchema#integer'
        },
        'http://www.w3.org/ns/shacl#path': {
          '@value': 'https://example.com/field'
        } as any
      }
    };

    expect(() => nodeShapeToJSONSchema(shape)).toThrow('Unsupported shacl:path.');
  });

  it('throws an error if an unsupported shacl:datatype is used.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': {
        'http://www.w3.org/ns/shacl#datatype': {
          '@id': 'http://example.com/unsupported'
        },
        'http://www.w3.org/ns/shacl#maxCount': {
          '@value': 1,
          '@type': 'http://www.w3.org/2001/XMLSchema#integer'
        },
        'http://www.w3.org/ns/shacl#path': {
          '@id': 'https://example.com/field'
        }
      }
    };

    expect(() => nodeShapeToJSONSchema(shape)).toThrow('shacl:datatype http://example.com/unsupported is not supported.');
  });

  it('throws an error if a property does not have shacl:datatype, shacl:node, or shacl:nodeKind.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': {
        'http://www.w3.org/ns/shacl#maxCount': {
          '@value': 1,
          '@type': 'http://www.w3.org/2001/XMLSchema#integer'
        },
        'http://www.w3.org/ns/shacl#path': {
          '@id': 'https://example.com/field'
        }
      }
    };

    expect(() => nodeShapeToJSONSchema(shape)).toThrow('Only property shapes with shacl:datatype and shacl:node are supported.');
  });

  it('throws an error if a property uses an invalid shacl:nodeKind.', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#nodeKind': {
            '@id': 'http://www.w3.org/ns/shacl#UnsupportedNodeKind' as any
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    expect(() => nodeShapeToJSONSchema(shape)).toThrow('Invalid shacl:nodeKind http://www.w3.org/ns/shacl#UnsupportedNodeKind.');
  });

  it('converts nodeshapes with a non array property field.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': {
        'http://www.w3.org/ns/shacl#datatype': {
          '@id': 'http://www.w3.org/2001/XMLSchema#string'
        },
        'http://www.w3.org/ns/shacl#maxCount': {
          '@value': 1,
          '@type': 'http://www.w3.org/2001/XMLSchema#integer'
        },
        'http://www.w3.org/ns/shacl#path': {
          '@id': 'https://example.com/field'
        }
      }
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string'
        }
      }
    });
  });

  it('converts a string data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string'
        }
      }
    })
  });

  it('adds enum values for properties with shacl:in.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#in': [
            {
              '@value': 'a',
              '@type': 'http://www.w3.org/2001/XMLSchema#string'
            },
            {
              '@value': 'b',
              '@type': 'http://www.w3.org/2001/XMLSchema#string'
            },
            {
              '@value': 'c',
              '@type': 'http://www.w3.org/2001/XMLSchema#string'
            },
          ],
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          enum: [ 'a', 'b', 'c' ]
        }
      }
    })
  });

  it('adds maxLength for string data type properties.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#maxLength': {
            '@value': 5,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          maxLength: 5
        }
      }
    })
  });

  it('adds pattern for string data type properties.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#pattern': {
            '@value': '^\w+',
            '@type': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          pattern: '^\w+'
        }
      }
    })
  });

  it('converts an integer data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'integer'
        }
      }
    })
  });

  it('adds exlusiveMinimum, minimum, exclusiveMaximum, and maximum for numerical data type properties.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#minExclusive': {
            '@value': 2,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#minInclusive': {
            '@value': 3,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#maxExclusive': {
            '@value': 6,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#maxInclusive': {
            '@value': 5,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'integer',
          exclusiveMinimum: 2,
          minimum: 3,
          exclusiveMaximum: 6,
          maximum: 5
        }
      }
    })
  });

  it('converts a numerical data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#decimal'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'number'
        }
      }
    })
  });

  it('converts a boolean data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#boolean'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'boolean'
        }
      }
    })
  });

  it('converts a dateTime data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#dateTime'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          format: 'date-time'
        }
      }
    })
  });

  it('converts a date data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#date'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          format: 'date'
        }
      }
    })
  });

  it('converts a time data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#time'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          format: 'time'
        }
      }
    })
  });

  it('converts a json data type.', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#JSON'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: ['string', 'number', 'boolean', 'object', 'array'],
        }
      }
    })
  });

  it('uses shacl:name as the name of fields if the useNames option is true', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#name': {
            '@value': 'field',
            '@type': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape, { useNames: true });
    expect(schema).toEqual({
      type: 'object',
      properties: {
        field: { 
          type: 'string'
        }
      }
    })
  });

  it('adds titles to fields if the addTitles option is true', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#name': {
            '@value': 'field',
            '@type': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape, { addTitles: true });
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          title: 'field'
        }
      }
    })
  });

  it('adds descriptions to fields if the addDescriptions option is true', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#description': {
            '@value': 'You do things with this field',
            '@type': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape, { addDescriptions: true });
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string',
          description: 'You do things with this field'
        }
      }
    })
  });

  it('parses compacted string paths', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'string'
        }
      }
    })
  });

  it('does not add properties with maxCount of 0', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 0,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {}
    })
  });

  it('add properties with no maxCount and no minCount as arrays', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    })
  });

  it('add properties with no minCount and a maxCount greater than 1 as arrays with a maxItems', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 4,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'array',
          items: {
            type: 'string'
          },
          maxItems: 4
        }
      }
    })
  });

  it('add properties with a minCount greater than 0 as required arrays with minItems', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#minCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': { 
          type: 'array',
          items: {
            type: 'string'
          },
          minItems: 1
        }
      },
      required: [ 'https://example.com/field' ]
    })
  });

  it('add properties with minCount and maxCount equal to 1 as required', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#minCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'string'
        }
      },
      required: [ 'https://example.com/field' ]
    })
  });

  it('add properties maxCount of 1 and no min count as not required and not arrays', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'string'
        }
      }
    })
  });

  it('converts a property with a nodeshape into a nested object schema', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          },
          'http://www.w3.org/ns/shacl#node': {
            'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
            'http://www.w3.org/ns/shacl#property': [
              {
                'http://www.w3.org/ns/shacl#maxCount': {
                  '@value': 1,
                  '@type': 'http://www.w3.org/2001/XMLSchema#integer'
                },
                'http://www.w3.org/ns/shacl#path': {
                  '@id': 'https://example.com/nestedField'
                },
                'http://www.w3.org/ns/shacl#datatype': {
                  '@id': 'http://www.w3.org/2001/XMLSchema#string'
                }
              }
            ]
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'object',
          properties: {
            'https://example.com/nestedField': {
              type: 'string'
            }
          }
        }
      }
    })
  });

  it('converts a property with an array of nodeshapes into an allOf of nested object schema', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          },
          'http://www.w3.org/ns/shacl#node': [
            {
              'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
              'http://www.w3.org/ns/shacl#property': [
                {
                  'http://www.w3.org/ns/shacl#maxCount': {
                    '@value': 1,
                    '@type': 'http://www.w3.org/2001/XMLSchema#integer'
                  },
                  'http://www.w3.org/ns/shacl#path': {
                    '@id': 'https://example.com/nestedField'
                  },
                  'http://www.w3.org/ns/shacl#datatype': {
                    '@id': 'http://www.w3.org/2001/XMLSchema#string'
                  }
                }
              ]
            },
            {
              'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class2',
              'http://www.w3.org/ns/shacl#property': [
                {
                  'http://www.w3.org/ns/shacl#maxCount': {
                    '@value': 1,
                    '@type': 'http://www.w3.org/2001/XMLSchema#integer'
                  },
                  'http://www.w3.org/ns/shacl#path': {
                    '@id': 'https://example.com/nestedField2'
                  },
                  'http://www.w3.org/ns/shacl#datatype': {
                    '@id': 'http://www.w3.org/2001/XMLSchema#string'
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          allOf: [
            {
              type: 'object',
              properties: {
                'https://example.com/nestedField': {
                  type: 'string'
                }
              }
            },
            {
              type: 'object',
              properties: {
                'https://example.com/nestedField2': {
                  type: 'string'
                }
              }
            }
          ]
        }
      }
    })
  });

  it('adds multiple properties with a minCount greater than 0 as required', (): void => {
    const shape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#minCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        },
        {
          'http://www.w3.org/ns/shacl#datatype': {
            '@id': 'http://www.w3.org/2001/XMLSchema#string'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#minCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field2'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'string'
        },
        'https://example.com/field2': {
          type: 'string'
        }
      },
      required: [ 'https://example.com/field', 'https://example.com/field2' ]
    })
  });

  it('converts a property with shacl:nodeKind set to shacl:IRI', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#nodeKind': {
            '@id': 'http://www.w3.org/ns/shacl#IRI'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'string'
        },
      }
    });
  });

  it('converts a property with shacl:nodeKind set to shacl:BlankNode', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#nodeKind': {
            '@id': 'http://www.w3.org/ns/shacl#BlankNode'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'object'
        },
      }
    });
  });

  it('converts a property with shacl:nodeKind set to shacl:BlankNodeOrIRI', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#nodeKind': {
            '@id': 'http://www.w3.org/ns/shacl#BlankNodeOrIRI'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: [ 'object', 'string' ]
        },
      }
    });
  });

  it('converts a property with shacl:nodeKind set to shacl:Literal, shacl:IRIOrLiteral or shacl:BlankNodeOrLiteral', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': [
        {
          'http://www.w3.org/ns/shacl#nodeKind': {
            '@id': 'http://www.w3.org/ns/shacl#Literal'
          },
          'http://www.w3.org/ns/shacl#maxCount': {
            '@value': 1,
            '@type': 'http://www.w3.org/2001/XMLSchema#integer'
          },
          'http://www.w3.org/ns/shacl#path': {
            '@id': 'https://example.com/field'
          }
        }
      ]
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: ['string', 'number', 'boolean', 'object', 'array']
        },
      }
    });
  });

  it('converts a property with multiple paths.', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#property': {
        'http://www.w3.org/ns/shacl#datatype': {
          '@id': 'http://www.w3.org/2001/XMLSchema#string'
        },
        'http://www.w3.org/ns/shacl#maxCount': {
          '@value': 1,
          '@type': 'http://www.w3.org/2001/XMLSchema#integer'
        },
        'http://www.w3.org/ns/shacl#path': [
          { '@id': 'https://example.com/field' },
          { '@id': 'https://example.com/field2' }
        ]
      }
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'string'
        },
        'https://example.com/field2': {
          type: 'string'
        },
      }
    });
  });

  it('sets additionalProperties to false if shacl:closed is true.', (): void => {
    const shape: NodeShape = {
      '@type': 'shacl:NodeShape',
      'http://www.w3.org/ns/shacl#targetClass': 'https://example.com/Class',
      'http://www.w3.org/ns/shacl#closed': {
        '@value': true,
        '@type': 'http://www.w3.org/2001/XMLSchema#boolean'
      },
      'http://www.w3.org/ns/shacl#property': {
        'http://www.w3.org/ns/shacl#datatype': {
          '@id': 'http://www.w3.org/2001/XMLSchema#string'
        },
        'http://www.w3.org/ns/shacl#maxCount': {
          '@value': 1,
          '@type': 'http://www.w3.org/2001/XMLSchema#integer'
        },
        'http://www.w3.org/ns/shacl#path': { 
          '@id': 'https://example.com/field' 
        }
      }
    };

    const schema = nodeShapeToJSONSchema(shape);
    expect(schema).toEqual({
      type: 'object',
      properties: {
        'https://example.com/field': {
          type: 'string'
        }
      },
      additionalProperties: false
    });
  });


  // Test 
  // multiple paths?
  // shacl:closed
});