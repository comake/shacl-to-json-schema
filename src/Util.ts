import { ListObject } from 'jsonld';
import { OrArray, ValueObject } from './Types';

type ValueObjectType<T> = T extends ValueObject<infer Item> | ValueObject<infer Item>[] ? Item : T

export function getValue<
  TJ extends OrArray<ValueObject<any>> | ListObject,
  T = ValueObjectType<TJ>,
  TArray = TJ extends ValueObject<any>[] ? true : false
>(
  fieldValue: TJ
): TArray extends true ? OrArray<T> : T {
  if (fieldValue && Array.isArray(fieldValue)) {
    return fieldValue.flatMap((valueItem): OrArray<T> => getValue(valueItem)) as TArray extends true ? OrArray<T> : T
  } else if (typeof fieldValue === 'object') {
    if ('@list' in fieldValue) {
      return getValue(fieldValue['@list'] as OrArray<ValueObject<any>>)
    }
    return fieldValue['@value'] as T;
  }
  return fieldValue;
}