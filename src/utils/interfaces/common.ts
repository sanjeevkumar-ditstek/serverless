import { AWSS3Service } from "../../services/AwsS3Service";
const awsS3Service = new AWSS3Service();
export interface IError {
    message: string
}
export function joiToError(joiError: any): IError {
    let message = 'There was an error processing your request. Please contact support.';
    if (joiError && joiError.details && joiError.details[0]) {
        message = joiError.details[0].message;
    } else {
        message = joiError.message;
    }

    const error: IError = {
        message,
    };

    return error;
}

export function toError(message: string): IError {
    const error: IError = {
        message,
    };

    return error;
}

/**
 * 
 * @param data 
 * @param destinationUrl 
 * @returns 
 */
export async function fileUploadInDestination(files, destinationUrl: string) {
    try {
        const filetype = files[0]?.filename.substring(files[0].filename.lastIndexOf(".") + 1);
        const fileName = `${destinationUrl}${Date.now()}.${filetype}`;
        files[0].filename = fileName;
        const upload = await awsS3Service.upload(files[0]);
        upload.fileName = fileName
        return upload
    } catch (error) {
        return error;
    }
}