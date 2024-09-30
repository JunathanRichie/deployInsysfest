/* eslint-disable */
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { AddTaskModel } from "@/model/taskModel";
import { AddTaskValidation } from "@/utils/Validation";
import Joi from "joi";
import {
  responseError,
  responseSuccessWithoutData,
} from "@/utils/API-Response";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "@/utils/ErrorHandling";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "@/utils/JWT-Token";


const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      console.log(req.body);      
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Login first to access this route"
        );
      }
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        throw new CustomError(StatusCodes.UNAUTHORIZED, "Invalid token");
      }

      const userId = (decoded as JwtPayload).id as string;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new CustomError(StatusCodes.NOT_FOUND, "User not found");
      }

      const {
        error,
        value,
      }: {
        error?: Joi.ValidationError;
        value: AddTaskModel;
      } = AddTaskValidation.validate(req.body);
      if (error) {
        responseError(res, false, error);
        return;
      }
      try {
        const task = await prisma.task.create({
          data: {
            name: value.name,
            startTime: new Date(value.startTime),
            endTime: new Date(value.endTime),
            details: value.details,
            status: value.status,
            category: value.category,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
        responseSuccessWithoutData(
          res,
          StatusCodes.OK,
          true,
          "Tasks have been added successfully"
        );
      } catch (error) {
        responseError(res, false, error);
      }
    } catch (error) {
      responseError(res, false, error);
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
