import type { SHACL, RDF } from './Vocabulary';
import type { NodeObject } from 'jsonld';

export type OrArray<T> = T | T[];

export type JSONObject = Record<string, JSONValue>;

export type JSONArray = JSONValue[];

export type JSONValue =
  | string
  | number
  | boolean
  | {[x: string]: JSONValue }
  | JSONArray;

export interface ValueObject<T extends string | boolean | number | JSONObject | JSONArray> {
  ['@type']: string;
  ['@value']: T;
  ['@language']?: string;
  ['@direction']?: string;
}

export type IRIObject<T extends string = string> = { '@id': T };

export type ShaclIRI = string | IRIObject;
export type ShaclIRIOrLiteral = ShaclIRI | ValueObject<any>;

export type NodeKindValues = 
| typeof SHACL.Literal
| typeof SHACL.IRI
| typeof SHACL.BlankNode
| typeof SHACL.BlankNodeOrIRI
| typeof SHACL.BlankNodeOrLiteral
| typeof SHACL.IRIOrLiteral;

export type BaseShape = NodeObject & {
  [SHACL.targetNode]?: ShaclIRIOrLiteral;
  [SHACL.targetClass]?: ShaclIRI;
  [SHACL.targetSubjectsOf]?: ShaclIRI;
  [SHACL.targetObjectOf]?: ShaclIRI;
  [SHACL.severity]?: ShaclIRI;
  [SHACL.message]?: OrArray<ValueObject<string>>;
  [SHACL.deactivated]?: ValueObject<boolean>;
  [SHACL.and]?: ShapesListShape;
  [SHACL.class]?: OrArray<ShaclIRI>;
  [SHACL.closed]?: ValueObject<boolean>;
  [SHACL.ignoredProperties]?: ShaclIRI[];
  [SHACL.disjoint]?: OrArray<ShaclIRI>;
  [SHACL.equals]?: OrArray<ShaclIRI>;
  [SHACL.in]?: any[];
  [SHACL.languageIn]?: string[];
  [SHACL.maxExclusive]?: ValueObject<number>;
  [SHACL.maxInclusive]?: ValueObject<number>;
  [SHACL.maxLength]?: ValueObject<number>;
  [SHACL.minExclusive]?: ValueObject<number>;
  [SHACL.minInclusive]?: ValueObject<number>;
  [SHACL.minLength]?: ValueObject<number>;
  [SHACL.nodeKind]?: IRIObject<NodeKindValues>;
  [SHACL.or]?: ShapesListShape;
  [SHACL.pattern]?: ValueObject<string>
  [SHACL.flags]?: ValueObject<string>,
  [SHACL.xone]?: ShapesListShape;
}

export type ShapesListShape = (PropertyShape | NodeShape)[];

export interface PropertyShape extends BaseShape {
  [SHACL.path]: PathShape;
  [SHACL.datatype]?: ShaclIRI;
  [SHACL.node]?: OrArray<NodeShape>;
  [SHACL.name]?: ValueObject<string>;
  [SHACL.description]?: ValueObject<string>;
  [SHACL.minCount]?: ValueObject<number>;
  [SHACL.maxCount]?: ValueObject<number>;
  [SHACL.lessThanOrEquals]?: OrArray<ShaclIRI>;
  [SHACL.lessThan]?: OrArray<ShaclIRI>;
  [SHACL.qualifiedValueShape]?: OrArray<BaseShape>;
  [SHACL.qualifiedMaxCount]?: ValueObject<number>;
  [SHACL.qualifiedMinCount]?: ValueObject<number>;
  [SHACL.qualifiedValueShapesDisjoint]?: ValueObject<boolean>;
  [SHACL.uniqueLang]?: ValueObject<boolean>;
}

export interface NodeShape extends BaseShape {
  [SHACL.property]: OrArray<PropertyShape>,
}

export interface InversePath extends NodeShape {
  [SHACL.inversePath]: PathShape;
}

export interface ZeroOrMorePath extends NodeShape {
  [SHACL.zeroOrMorePath]: PathShape;
}

export interface OneOrMorePath extends NodeShape {
  [SHACL.oneOrMorePath]: PathShape;
}

export interface ZeroOrOnePath extends NodeShape {
  [SHACL.zeroOrOnePath]: PathShape;
}

export interface AlternativePath extends NodeShape {
  [SHACL.alternativePath]: PathTypes[];
}

export type PathTypes = 
| ShaclIRI  
| AlternativePath 
| ZeroOrMorePath 
| OneOrMorePath 
| ZeroOrOnePath 
| InversePath

export type PathShape = OrArray<PathTypes>

export interface ExternalDocumentation {
  description?: string;
  url: string;
  [k: string]: unknown;
}

export interface Discriminator {
  propertyName: string;
  mapping?: Record<string, string>;
  [k: string]: unknown;
}

export interface XML {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
  [k: string]: unknown;
}

export interface JSONSchema {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: unknown[];
  type?: OrArray<'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string'>;
  not?: JSONSchema;
  allOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  items?: JSONSchema;
  properties?: Record<string, JSONSchema>;
  additionalProperties?: JSONSchema | boolean;
  description?: string;
  format?: string;
  default?: unknown;
  nullable?: boolean;
  discriminator?: Discriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: unknown;
  externalDocs?: ExternalDocumentation;
  deprecated?: boolean;
  xml?: XML;
  [k: string]: unknown;
}

export type ObjectJSONSchema = JSONSchema & Required<Pick<JSONSchema, 'properties'>> & { type: 'object' }