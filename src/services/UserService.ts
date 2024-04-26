'use strict';
import * as _ from 'lodash';
import { getLogger, Logger } from "log4js";
// import { MongoUtil } from '../util/mongoUtil';
import { Document, Schema, Model, model } from 'mongoose';
import { Constants as constants } from '../utils/Constants';
import UserMongo from '../models/user.mongo';
import IUser from '../utils/interfaces/IUser';

export interface IUserModel extends IUser, Document {
    _id: string,
}

export const UserSchema = new Schema(UserMongo);
export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);

export class UserService {
    protected stage: String;
    protected logger: Logger;
    constructor() {
        this.logger = getLogger();
        this.stage = constants.stage;
        this.logger.level = constants.logLevel;
    }
    public static OPERATION_UNSUCCESSFUL = class extends Error {
        constructor() {
            super('An error occured while processing the request.');
        }
    };

    /**
     * Description: Find a user by their email
     * @param  {string} email
     * @returns Promise
     */
    public async findByEmail(email: string, attributes: object = {}): Promise<IUser | null> {
        let user: IUser;
        try {
            const regexemail = new RegExp("^" + email.replace(/[-\/\\+!#]/g, '\\$&') + '$', 'i');
            let condition = { email: regexemail }
            if (attributes) {
                condition = { ...attributes, ...condition }
            }
            user = await User.findOne(condition).lean();
        } catch (e) {
            return Promise.reject(e);
        }
        return user;
    }

    /**
     * findById : Get User info by using ID
     * @param  {string} _id
     * @returns Promise
     */
    public async findById(_id: string): Promise<IUser | null> {
        let user: IUser;
        try {
            user = await User.findById(_id).lean();
        } catch (e) {
            return Promise.reject(e);
        }
        return user;
    }

}