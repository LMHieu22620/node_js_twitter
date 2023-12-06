import { Request, Response, Router } from 'express'
import {
  followController,
  forgotPasswordController,
  getMeProfileControllor,
  getProfileControllor,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetForgotPasswordController,
  unFollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  followValidator,
  forgotPasswordTokenValidator,
  forgotPasswordVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidatorSchema,
  resetForgotPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.request'
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
 * Description: register a user
 * Path: /register
 * Method:POST
 * Body:{email:string,password:string,confirm_password:string,date_of_birth:ISO8601}
 */
usersRouter.post('/register', registerValidatorSchema, wrapRequestHandler(registerController))
/*
 * Description: logout a user
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
 * Description. Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post('/forgot-password', forgotPasswordTokenValidator, wrapRequestHandler(forgotPasswordController))
/**
 * Description. Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: {forgot_password_token: string}
 */

usersRouter.post(
  '/verify-forgot-password',
  forgotPasswordVerifyTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: {forgot_password_token: string, password: string, confirm_password: string}
 */
usersRouter.post('/reset-password', resetForgotPasswordValidator, wrapRequestHandler(resetForgotPasswordController))

/**
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeProfileControllor))

/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get user profile
 * Path: /:username
 * Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileControllor))

/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)
/**
 * Description: unFollow someone
 * Path: /follow/:user_id
 * Method: delete
 * Header: { Authorization: Bearer <access_token> }
 * params: { user_id: string }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)
export default usersRouter
