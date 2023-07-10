type Namespace<T extends string, TBase extends string> = {
  [key in T]: `${TBase}${key}`
};

function createNamespace<T extends string, TBase extends string>(
  baseUri: TBase,
  localNames: T[],
): Namespace<T, TBase> {
  return localNames.reduce((obj: Namespace<T, TBase>, localName): Namespace<T, TBase> => (
    { ...obj, [localName]: `${baseUri}${localName}` }
  // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
  ), {} as Namespace<T, TBase>);
}

export const RDF = createNamespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', [
  'type',
  'nil',
  'first',
  'rest',
  'JSON',
]);

export const XSD = createNamespace('http://www.w3.org/2001/XMLSchema#', [
  'boolean',
  'integer',
  'double',
  'decimal',
  'string',
  'float',
  'positiveInteger',
  'negativeInteger',
  'int',
  'date',
  'time',
  'dateTime',
]);

export const SHACL = createNamespace('http://www.w3.org/ns/shacl#', [
  'NodeShape',
  'PropertyShape',
  'Literal',
  'IRI',
  'BlankNode',
  'BlankNodeOrIRI',
  'BlankNodeOrLiteral',
  'IRIOrLiteral',
  'property',
  'path',
  'name',
  'description',
  'minCount',
  'maxCount',
  'targetNode',
  'targetClass',
  'targetSubjectsOf',
  'targetObjectOf',
  'severity',
  'message',
  'deactivated',
  'and',
  'or',
  'class',
  'closed',
  'ignoredProperties',
  'datatype',
  'disjoint',
  'equals',
  'in',
  'languageIn',
  'lessThan',
  'lessThanOrEquals',
  'maxCount',
  'maxExclusive',
  'maxInclusive',
  'maxLength',
  'minCount',
  'minExclusive',
  'minInclusive',
  'minLength',
  'nodeKind',
  'pattern',
  'flags',
  'qualifiedMaxCount',
  'qualifiedMinCount',
  'qualifiedValueShape',
  'qualifiedValueShapesDisjoint',
  'uniqueLang',
  'xone',
  'inversePath',
  'zeroOrMorePath',
  'oneOrMorePath',
  'zeroOrOnePath',
  'alternativePath',
  'name',
  'node'
]);