import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USERS_MESSAGE } from '~/constants/messages'
config()

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }
  private emailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }
  private forgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_VERIFY_TOKEN as string
    })
  }

  private signAccessTokenAndRefreshToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.emailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    // this.signAccessTokenAndRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    console.log('email_verify_token: ', email_verify_token)

    return {
      access_token,
      refresh_token
    }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: verify
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGE.LOGOUT_SUCCESS
    }
  }
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
            // updated_at: new Date()
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.emailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    console.log('Rensend verify email: ', email_verify_token)

    databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // const [access_token, refresh_token] = token
    return {
      message: USERS_MESSAGE.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.forgotPasswordToken({ user_id, verify })

    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // const [access_token, refresh_token] = token
    return {
      message: USERS_MESSAGE.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetForgotPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // const [access_token, refresh_token] = token
    return {
      message: USERS_MESSAGE.RESET_PASSWORD_SUCCESS
    }
  }
  async getMeProfile(user_id: string) {
    const result = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    return {
      result
    }
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return user
  }
}

const usersService = new UsersService()
export default usersService
