import { ConversionOptions } from './ConversionOptions';
import { PropertyShape, NodeShape, JSONSchema, ShaclIRI, ObjectJSONSchema, IRIObject } from './Types';
import { getValue } from './Util';
import { RDF, SHACL, XSD } from './Vocabulary';

function stringDatatypeToJSONSchema(shape: PropertyShape): JSONSchema {
  const schema: JSONSchema = { type: 'string' };
  if (SHACL.maxLength in shape) {
    const maxLengthValue = getValue(shape[SHACL.maxLength]!);
    schema.maxLength = maxLengthValue;
  }
  if (SHACL.pattern in shape) {
    const patternValue = getValue(shape[SHACL.pattern]!);
    schema.pattern = patternValue;
  }
  return schema
}

function addMinAndMaxToJSONSchema(shape: PropertyShape, schema: JSONSchema): JSONSchema {
  if (SHACL.minExclusive in shape) {
    const minExclusiveValue = getValue(shape[SHACL.minExclusive]!);
    schema.exclusiveMinimum = minExclusiveValue;
  }
  if (SHACL.minInclusive in shape) {
    const minInclusiveValue = getValue(shape[SHACL.minInclusive]!);
    schema.minimum = minInclusiveValue;
  }
  if (SHACL.maxExclusive in shape) {
    const maxExclusiveValue = getValue(shape[SHACL.maxExclusive]!);
    schema.exclusiveMaximum = maxExclusiveValue;
  }
  if (SHACL.maxInclusive in shape) {
    const maxInclusiveValue = getValue(shape[SHACL.maxInclusive]!);
    schema.maximum = maxInclusiveValue;
  }
  return schema;
}

function numberDatatypeToJSONSchema(shape: PropertyShape): JSONSchema {
  const schema: JSONSchema = { type: 'number' };
  addMinAndMaxToJSONSchema(shape, schema);
  return schema
}

function integerDatatypeToJSONSchema(shape: PropertyShape): JSONSchema {
  const schema: JSONSchema = { type: 'integer' };
  addMinAndMaxToJSONSchema(shape, schema);
  return schema
}

function getBaseSchemaForShapeDatatype(shape: PropertyShape): JSONSchema {
  const datatype = shape[SHACL.datatype]!
  const datatypeAsString = typeof datatype === 'object' ? datatype['@id'] : datatype;
  switch(datatypeAsString) {
    case XSD.string:
      return stringDatatypeToJSONSchema(shape);
    case XSD.decimal:
    case XSD.float:
    case XSD.double:
      return numberDatatypeToJSONSchema(shape);
    case XSD.integer:
    case XSD.int:
    case XSD.negativeInteger:
    case XSD.positiveInteger:
      return integerDatatypeToJSONSchema(shape);
    case XSD.boolean:
      return { type: 'boolean' };
    case XSD.dateTime:
      return { type: 'string', format: 'date-time' };
    case XSD.date:
      return { type: 'string', format: 'date' };
    case XSD.time:
      return { type: 'string', format: 'time' };
    case RDF.JSON:
      return { type: ['string', 'number', 'boolean', 'object', 'array'] };
    default: 
      throw new Error(`shacl:datatype ${datatypeAsString} is not supported.`);
  }
}

function propertyShapeWithDatatypeToJSONSchema(
  shape: PropertyShape,
): JSONSchema {
  const schema = getBaseSchemaForShapeDatatype(shape)
  if (SHACL.in in shape) {
    const enumValues = getValue(shape[SHACL.in]!);
    schema.enum = Array.isArray(enumValues) ? enumValues : [ enumValues ];
  }
  return schema;
}

function propertyShapeWithNodeToJSONSchema(
  shape: PropertyShape,
  options?: ConversionOptions,
) {
  const node = shape[SHACL.node]!;
  if (Array.isArray(node)) {
    return {
      allOf: node.map(nodeItem => nodeShapeToJSONSchema(nodeItem, options)),
    }
  }
  return nodeShapeToJSONSchema(node, options)
}

function propertyShapeWithNodeKindToJSONSchema(shape: PropertyShape): JSONSchema {
  const nodeKind = shape[SHACL.nodeKind]!['@id']
  if (nodeKind === SHACL.IRI) {
    return { type: 'string' };
  }
  if (nodeKind === SHACL.BlankNode) {
    return { type: 'object' }
  } 
  if (nodeKind === SHACL.BlankNodeOrIRI) {
    return { type: ['object', 'string'] };
  }
  if (nodeKind === SHACL.BlankNodeOrLiteral || nodeKind === SHACL.IRIOrLiteral || nodeKind === SHACL.Literal) {
    return { type: ['string', 'number', 'boolean', 'object', 'array']}
  }
  throw new Error(`Invalid shacl:nodeKind ${nodeKind}.`);
}
 
function propertyShapeToJSONSchema(
  shape: PropertyShape,
  maxCountValue: number | undefined,
  minCountValue: number | undefined,
  options?: ConversionOptions,
): JSONSchema {
  let schema: JSONSchema | undefined;
  if (SHACL.datatype in shape) {
    schema = propertyShapeWithDatatypeToJSONSchema(shape);
  } else if (SHACL.node in shape) {
    schema = propertyShapeWithNodeToJSONSchema(shape, options);
  } else if (SHACL.nodeKind in shape) {
    schema = propertyShapeWithNodeKindToJSONSchema(shape);
  } else {
    throw new Error('Only property shapes with shacl:datatype and shacl:node are supported.');
  }
  if (maxCountValue !== 0 && maxCountValue !== 1) {
    schema = { 
      type: 'array', 
      items: schema, 
      ...maxCountValue !== undefined ? { maxItems: maxCountValue } : {},
      ...minCountValue !== undefined ? { minItems: minCountValue } : {} 
    };
  }
  if (options?.addTitles && SHACL.name in shape) {
    const nameValues = getValue(shape[SHACL.name]!);
    schema.title = Array.isArray(nameValues) ? nameValues[0] : nameValues;
  }
  if (options?.addDescriptions && SHACL.description in shape) {
    const descriptionValues = getValue(shape[SHACL.description]!);
    schema.description = Array.isArray(descriptionValues) ? descriptionValues[0] : descriptionValues;
  }
  return schema;
}

function getFieldNameFromProperty(property: PropertyShape, options?: ConversionOptions) {
  const path = property[SHACL.path];
    const names = SHACL.name in property ? getValue(property[SHACL.name]!) : [];
    const name = Array.isArray(names) ? names[0] : names;
    if (options?.useNames && SHACL.name in property) {
      const names = SHACL.name in property ? getValue(property[SHACL.name]!) : [];
      const name = Array.isArray(names) ? names[0] : names;
      return name;
    } else if (typeof path === 'string') {
      return path;
    } else if (typeof path === 'object' && '@id' in path) {
      return options?.useNames ? name : (path  as IRIObject)['@id'];
    } else {
      throw new Error('Unsupported shacl:path.');
    }
}

function getMinAndMaxCountFromProperty(property: PropertyShape) {
  let maxCountValue: number | undefined;
  let minCountValue: number | undefined;
  if (SHACL.maxCount in property) {
    maxCountValue = getValue(property[SHACL.maxCount]!);
  }
  if (SHACL.minCount in property) {
    minCountValue = getValue(property[SHACL.minCount]!);
  }
  return [maxCountValue, minCountValue];
}

function addFieldAsRequiredInSchemaIfMinCountGreaterThanZero(
  schema: ObjectJSONSchema, 
  fieldName: string, 
  minCountValue: number | undefined,
) {
  if (minCountValue !== undefined && minCountValue > 0) {
    if (!schema.required) {
      schema.required = [ fieldName ]
    } else {
      schema.required.push(fieldName);
    }
  }
}

function addPropertyToSchema(property: PropertyShape, schema: ObjectJSONSchema, options?: ConversionOptions) {
  const path = property[SHACL.path];
  if (Array.isArray(path)) {
    path.forEach((pathOption) => {
      addPropertyToSchema(
        { ...property, [SHACL.path]: pathOption }, 
        schema,
        options,
      );
    });
  } else {
    const [ maxCountValue, minCountValue ] = getMinAndMaxCountFromProperty(property);
    if (maxCountValue !== 0) {
      const fieldName = getFieldNameFromProperty(property, options);
      addFieldAsRequiredInSchemaIfMinCountGreaterThanZero(schema, fieldName, minCountValue)
      const propertySchema = propertyShapeToJSONSchema(property, maxCountValue, minCountValue, options);
      schema.properties[fieldName] = propertySchema;
    }
  }
}

export function nodeShapeToJSONSchema(shape: NodeShape, options?: ConversionOptions): ObjectJSONSchema {
  const schema: ObjectJSONSchema = { type: 'object', properties: {} };
  if (Array.isArray(shape[SHACL.property])) {
    const properties = shape[SHACL.property] as PropertyShape[];
    properties.forEach((property) => {
      addPropertyToSchema(property, schema, options);
    });
  } else {
    addPropertyToSchema(shape[SHACL.property] as PropertyShape, schema, options);
  }
  if (SHACL.closed in shape && getValue(shape[SHACL.closed]!) === true) {
    schema.additionalProperties = false;
  }
  return schema;
}