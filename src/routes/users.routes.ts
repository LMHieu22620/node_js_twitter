import { Request, Response, Router } from 'express'
import {
  forgotPasswordController,
  getMeProfileControllor,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetForgotPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidatorSchema,
  resetForgotPasswordValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/*
 * Description: Login a user
 * Path: /login
 * Method:POST
 * Body:{email:string,password:string}
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
/*
 * Description: Login a user
 * Path: /register
 * Method:POST
 * Body:{email:string,password:string,confirm_password:string,date_of_birth:ISO8601}
 */
usersRouter.post('/register', registerValidatorSchema, wrapRequestHandler(registerController))
/*
 * Description: Login a user
 * Path: /logout
 * Method:POST
 * Header:{Authorization: Bearer <access_token>}
 * Body:{refresh_token:string}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
/**
 * Description. Verify email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description. Verify email when user client click on the link in email
 * Path: /resend-verify-email
 * Method: POST
 * Header:{Authorization: Bearer <access_token>}
 * Body: {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description. forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { email:string }
 */
usersRouter.post('/forgot-password', forgotPasswordTokenValidator, wrapRequestHandler(forgotPasswordController))
/**
 * Description. forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { email:string }
 */

usersRouter.post(
  '/verify-forgot-password',
  forgotPasswordVerifyTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description.reset forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { password:string,confirm_password:string,forgot_password_token:string }
 */
usersRouter.post('/reset-password', resetForgotPasswordValidator, wrapRequestHandler(resetForgotPasswordController))

/**
 * Description. forgot password
 * Path: /me
 * Method: POST
 * Header:{Authorization: Bearer <access_token>}
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeProfileControllor))

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 */
usersRouter.patch('/me', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(updateMeController))

export default usersRouter
