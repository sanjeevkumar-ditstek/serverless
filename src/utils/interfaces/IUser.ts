
export default interface IUser {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    isEmailVerified: boolean;
    newEmail?: string;
    image: string;
    status: string;
    otp: number;
    token?: string;
}


export interface IUserLogin extends IUser {
    token: string;
    expireIn: number;
}
