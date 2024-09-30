import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { AddCourseModel } from "@/model/courseModel";
import { AddCourseValidation } from "@/utils/Validation";
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
        value: AddCourseModel;
      } = AddCourseValidation.validate(req.body);
      if (error) {
        responseError(res, false, error);
        return;
      }
      try {
        await prisma.course.create({
          data: {
            name: value.name,
            color: value.color,
            userId,
          },
        });
        responseSuccessWithoutData(
          res,
          StatusCodes.OK,
          true,
          "Courses have been added successfully"
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
