export interface ConversionOptions {
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