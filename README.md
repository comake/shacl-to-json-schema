# SHACL To JSON Schema

This is a simple library to translate SHACL NodeShapes into JSON Schemas. It does not support the full SHACL vocabulary, only those fields which can be applied to JSON Schema.

## Install

```shell
npm install @comake/shacl-to-json-schema
```

## Usage

The `nodeShapeToJSONSchema` function exported by this library supports converting SHACL NodeShapes encoded as JSON-LD into JSON Schema.

For example, using Typescript:
```ts
import { nodeShapeToJSONSchema } from '@comake/shacl-to-json-schema';

const nodeShape = {
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
      }
      'http://www.w3.org/ns/shacl#path': {
        '@id': 'https://example.com/field'
      }
    }
  ]
};

const schema = nodeShapeToJSONSchema(nodeShape);
console.log(schema);

// Output:
// {
//   type: 'object',
//   properties: {
//     'https://example.com/field': { 
//       type: 'string'
//     }
//   }
// }
```

By default the `shacl:path` of each property will be used as the property key in the resulting JSON Schema. If instead you need the generated JSON Schema to use the `shacl:name` field as property keys, set the `useNames` option to `true`:

```ts
const schema = nodeShapeToJSONSchema(nodeShape, { useNames: true });
console.log(schema);

// Output:
// {
//   type: 'object',
//   properties: {
//     field: {   <---- Uses "field" instead of "https://example.com/field"
//       type: 'string'
//     }
//   }
// }
```



## Support

Currently this library only supports properties that include a `shacl:datatype`, `shacl:node`, or `shacl:nodeKind`.

Supported `shacl:datatype` values:
- `xsd:string` generates a JSON Schema with type `string`
- `xsd:integer` generates a JSON Schema with type `integer`
- `xsd:negativeInteger` generates a JSON Schema with type `integer`
- `xsd:positiveInteger` generates a JSON Schema with type `integer`
- `xsd:int` generates a JSON Schema with type `integer`
- `xsd:decimal` generates a JSON Schema with type `number`
- `xsd:float` generates a JSON Schema with type `number`
- `xsd:double` generates a JSON Schema with type `number`
- `xsd:boolean` generates a JSON Schema with type `boolean`
- `xsd:dateTime` generates a JSON Schema with type `string` and format `data-time`
- `xsd:date` generates a JSON Schema with type `string` and format `date`
- `xsd:time` generates a JSON Schema with type `string` and format `time`
- `rdf:JSON` generates a JSON Schema with type `string`, `number`, `boolean`, `object`, or `array`

Supported `shacl:nodeKind` values:
- `sh:BlankNode` generates a JSON Schema with type `object`
- `sh:IRI` generates a JSON Schema with type `string`
- `sh:Literal` generates a JSON Schema with type `string`, `number`, `boolean`, `object`, or `array`
- `sh:BlankNodeOrIRI` generates a JSON Schema with type `string` or `object`
- `sh:BlankNodeOrLiteral` generates a JSON Schema with type `string`, `number`, `boolean`, `object`, or `array`
- `sh:IRIOrLiteral` generates a JSON Schema with type `string`, `number`, `boolean`, `object`, or `array`

Support for `shacl:maxLength`, which adds `maxLength` to the resulting JSON Schema property when the `shacl:datatype` is one of:
- `xsd:string`
- `xsd:dateTime`
- `xsd:date`
- `xsd:time`

Support for `shacl:in` for all datatypes, which produces a JSON Schema `enum`

Support for `shacl:minExclusive`, `shacl:minInclusive`, `shacl:maxExclusive`, `shacl:maxInclusive` for all numeric datatypes

Optional support for `shacl:name` and `shacl:description` when the options `addTitles` or `addDescriptions` are set to `true`, respectively. Doing so will add JSON Schema `title` and `description` to the resulting properties.

Support for `shacl:minCount` and `shacl:maxCount`:
- If `shacl:maxCount` is unset or greater than 1, the property will be treated as an array. If so, `shacl:maxCount` and `shacl:minCount` values are used to set `maxItems` and `minItems` in the resulting JSON Schema.
- If `shacl:minCount` is greater than 0, the property will be required in the resulting JSON Schema

Support for `shacl:closed`. When true, the resulting JSON Schema will have `additionalProperties` set to false.

## Not Supported

No support for SHACL predicates `shacl:lessThanOrEquals`, `shacl:lessThan`, `shacl:flag`, `shacl:equal`, `shacl:class`, and `shacl:languageIn`.

There is also currently no support for complex SHACL Property Paths including Sequence Paths, Alternative Paths, Inverse Paths, Zero-Or-More Paths, One-Or-More Paths, and Zero-Or-One Paths.

## API

### nodeShapeToJSONSchema

Converts SHACL NodeShapes encoded as JSON-LD into JSON Schema.

#### Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `shape` | `JSON` | Required | The SHACL NodeShape to convert encoded as JSON-LD. |
| `options` | `object` |  | A `ConversionOptions` object (see below).  |

#### ConversionOptions

These are the available options to configure the behavior of the conversion (in Typescript):

```ts
interface ConversionOptions {
  /**
   * When true, the names of fields in the generated JSON Schema 
   * will use the shacl:name of each property instead of the shacl:path uri
   */
  useNames?: boolean;
  /**
   * When true, each field will include a title equal 
   * to it's corresponding property's shacl:name
   */
  addTitles?: boolean;
  /**
   * When true, each field will include a description equal 
   * to it's corresponding property's shacl:description
   */
  addDescriptions?: boolean;
}
```

#### Return Value

A JSON Schema object