import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { LoginUserModel } from "@/model/userModel";
import { LoginUserVal } from "@/utils/Validation";
import Joi from "joi";
import {
  responseError,
  responseSuccess,
} from "@/utils/API-Response";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "@/utils/ErrorHandling";
import { generateAccessToken } from "@/utils/JWT-Token";


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
      value: LoginUserModel;
    } = LoginUserVal.validate(req.body, { abortEarly: false });
    if (error) {
      responseError(res, false, error);
      return;
    }
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: value.email
        }
      })
      if(!user){
        throw new CustomError(StatusCodes.BAD_REQUEST, "Email Not Found");
      }
      const auth = await bcrypt.compare(value.password, user.password);
      if (auth) {
        const payload = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        const token = generateAccessToken(payload);
        res.setHeader("Authorization", `Bearer ${token}`);
        responseSuccess(res, StatusCodes.OK, true, "User Login Successfully", {
          name: value.email,
          token: token,
        });
      }
      throw new CustomError(StatusCodes.UNAUTHORIZED, "Invalid Credentials");
    } catch (error) {
      responseError(res, false, error);
      return;
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
