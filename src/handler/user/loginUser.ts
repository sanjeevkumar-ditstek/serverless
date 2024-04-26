'use strict';
import { getLogger } from "log4js";
import { mongoDbConnect } from '../../modules/mongoConnect';
import { Constants, Constants as constants } from '../../utils/Constants';
import { ApiResponse } from '../../modules/ApiResponse';
import { UserService } from "../../services/UserService";
import * as Joi from "@hapi/joi";
import StatusCodeEnum from "../../utils/enums/StatusCodeEnum";
import ErrorMessageEnum from "../../utils/enums/ErrorMessageEnum";
import IUser, { IUserLogin } from "../../utils/interfaces/IUser";
import ResponseMessage from "../../utils/enums/ResponseMessages";
import LogsMessage from "../../utils/enums/LogsMessages";
import { AuthService } from "../../services/AuthService";
import * as Time from '../../utils/enums/Time';
import { EmailService } from "../../services/EmailService";
import { nanoid } from "nanoid";
import UserTypes from "../../utils/enums/UserTypes";
let handler = "handler(loginUserHandler): ";
const logger = getLogger();
logger.level = constants.logLevel;
export const loginUserHandler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await mongoDbConnect();
  const apiResponse = new ApiResponse();
  const userService = new UserService();
  const authService = new AuthService();
  const emailService = new EmailService();

  try {
    event.body = JSON.parse(event.body); 
    const schema = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
 
    const params = schema.validate(event.body, { abortEarly: false });
    if (params.error) {
      return apiResponse.setResponse(StatusCodeEnum.BAD_REQUEST, {success:false, message: ErrorMessageEnum.INVALID_REQUEST, error: params.error.details },{} );
    }

    const {email, password} = params.value

    //Make sure that account associated with this email exists in the database
    let user:IUser;
    try {
      user = await userService.findByEmail(email);
    } catch (e) {
      logger.error(LogsMessage.DUPLICATE_USER_EXIST, e);
      return apiResponse.setResponse(StatusCodeEnum.INTERNAL_SERVER_ERROR, {success:false, message: e.message}, {});
    }

    if (!user) {
      logger.error(LogsMessage.USER_LOGIN_FAIL, JSON.stringify(params?.value));
      return apiResponse.setResponse(StatusCodeEnum.BAD_REQUEST, { success:false, message: ErrorMessageEnum.USER_LOGIN_FAILED }, {});
    }
    
    // check If user email has been verified 
  
    if(!user.isEmailVerified){
      const { _id} = user
      const uniqueID = nanoid();
      const token = await authService.createToken({ '_id': user?._id, 'token': uniqueID , type: UserTypes.NEW_USER });
      const now = Time.now();
      const meta = {
        createdDate: user.meta.createdDate,
        modifiedDate: now,
      };
  
      // update user with verification true
      const attributes = { token: uniqueID, ...meta };
      const userResponse: IUser = await userService.updateUser(_id, attributes);
      if (!userResponse) {
        logger.error(LogsMessage.ERROR_RESENDING_LINK + handler, JSON.stringify(userResponse));
        return apiResponse.setResponse(StatusCodeEnum.BAD_REQUEST, { message: ErrorMessageEnum.INVALID_REQUEST, success: false }, {});
      }
      // const OTP: number = await authService.generateOTP();
      const sendEmailRequest = {
        toAddress: user?.email,
        userFullName: `${user?.firstName} ${user?.lastName}`,
        token:token,
        LINK:`${Constants.baseURL}/emailVerification?token=${token}`,
        // OTP: OTP
      };
      await emailService.sendVerificationEmail(sendEmailRequest);  
      user.password = undefined;
      user.otp = undefined;  
      logger.info(LogsMessage.LOGIN_WITH_EMAIL_NOT_VERIFIED, JSON.stringify(user));
      return apiResponse.setResponse(StatusCodeEnum.OK, {success:true, message: ResponseMessage.EMAIL_NOT_VERIFIED, data: user }, {});  
    }

    const comparePassword = await authService.comparePassword(password,user.password);
    if (!comparePassword) {
      logger.error(LogsMessage.USER_LOGIN_FAIL, JSON.stringify(params?.value));
      return apiResponse.setResponse(StatusCodeEnum.BAD_REQUEST, { success:false, message: ErrorMessageEnum.USER_PASSWORD_NOT_MATCHED }, {});
    }

    user.password = undefined;
    user.otp = undefined;
    const token = await authService.createToken(user); 
    const expireIn = Date.parse(new Date().toString()) + 30 * 60000;
    const response: IUserLogin = {...user, token,expireIn}
    logger.info(ResponseMessage.USER_LOGIN_SUCCESS, JSON.stringify(response));
    return apiResponse.setResponse(StatusCodeEnum.OK, {success:true, message: ResponseMessage.USER_LOGIN_SUCCESS, data: response }, {});
  } catch (err) {
    logger.error(LogsMessage.USER_REGISTRATION, err);
    return apiResponse.setResponse(StatusCodeEnum.INTERNAL_SERVER_ERROR,  { success: false, message: err.message}, {});
  }
}