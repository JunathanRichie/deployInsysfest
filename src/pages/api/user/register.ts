/* eslint-disable */

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { CreateUserModel } from "@/model/userModel";
import { RegisterUserVal } from "@/utils/Validation";
import Joi from "joi";
import {
  responseError,
  responseSuccess,
  responseSuccessWithoutData,
} from "@/utils/API-Response";
import bcrypt from "bcrypt";
import env from "@/config/loadEnv";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      error,
      value,
    }: {
      error?: Joi.ValidationError;
      value: CreateUserModel;
    } = RegisterUserVal.validate(req.body, { abortEarly: false });
    if (error) {
      responseError(res, false, error);
      return;
    }
    try {
      const hashedPassword = bcrypt.hashSync(value.password, env.HASH_SALT);
      const newUser = await prisma.user.create({
        data: {
          username: value.username,
          email: value.email,
          fullName: value.fullName,
          password: hashedPassword,
        },
      });
      responseSuccessWithoutData(
        res,
        StatusCodes.OK,
        true,
        "User has registered successfully"
      );
    } catch (error) {
      responseError(res, false, error);
      return;
      // res.status(400).json({ error: "User creation failed" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
