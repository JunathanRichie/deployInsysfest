/* eslint-disable */

import { NextApiResponse } from 'next';
import { StatusCodes } from "http-status-codes";
import { CustomError, getCustomErrorObject } from "./ErrorHandling";

export const responseSuccess = (
  res: NextApiResponse,
  code: number = StatusCodes.OK,
  success: true,
  message: string | null = null,
  data: Array<object> | object | undefined,
) => {
  return res.status(code).json({
    success,
    ...(message && { message }),
    data,
  });
};

export const responseSuccessWithoutData = (
  res: NextApiResponse,
  code: number = StatusCodes.OK,
  success: true,
  message: string | null = null,
) => {
  return res.status(code).json({
    success,
    ...(message && { message }),
  });
};

export const responseError = (res: NextApiResponse, success: false, error: any) => {
  const errorObject: CustomError = getCustomErrorObject(error);
  return res.status(errorObject.code).json({
    success,
    ...(errorObject.message && { message: errorObject.message }),
    ...(errorObject.errors && { errors: errorObject.errors }),
  });
};

export const responsePagination = <DataType>(
  res: NextApiResponse,
  code: number = StatusCodes.OK,
  success: true,
  message: string | null = null,
  data: PaginationData<DataType>,
) => {
  return res.status(code).json({
    success,
    ...(message && { message }),
    data,
  });
};

export interface PaginationData<DataType> {
  data_per_page: DataType;
  meta: {
    page: number;
    max_page: number;
  };
}