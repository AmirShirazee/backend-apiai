/**
 * @file ServiceListType.ts
 * Definition of ServiceListType used in service methods.
 */
import { CancelablePromise } from '../helpers/CancelablePromise';

export type ServiceListType = {
  service: string;
  method: string;
  methodFunc: () => CancelablePromise<any>;
};
