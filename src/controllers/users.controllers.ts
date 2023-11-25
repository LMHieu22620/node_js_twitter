import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import {
  ForgotPassword,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody
} from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'

import usersService from '~/services/users.services'

export const loginController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    result
  })
  // const result = await usersService.login()
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGE.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json(result)
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
  }

  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  const result = await usersService.resendVerifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGE.RESEND_MAIL_VERIFY_SUCCESS,
    result
  })
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USERS_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPassword>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User

  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })

  return res.json(result)
}

export const resetForgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPassword>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password, forgot_password_token } = req.body
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
  }
  if (user.forgot_password_token !== forgot_password_token) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.INVALID_FORGOT_PASSWORD_TOKEN
    })
  }
  const result = await usersService.resetForgotPassword(user_id, password)

  return res.json({
    message: USERS_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const getMeProfileControllor = async (
  req: Request<ParamsDictionary, any, ForgotPassword>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMeProfile(user_id)

  return res.json({
    message: USERS_MESSAGE.GET_ME_SUCCESS,
    result
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, ForgotPassword>,
  res: Response,
  next: NextFunction
) => {
  // const { user_id } = req.decoded_authorization as TokenPayload
  // const result = await usersService.getMeProfile(user_id)
  // return res.json({
  //   message: USERS_MESSAGE.GET_ME_SUCCESS,
  //   result
  // })
  return res.json({})
}
