import { nanoid } from 'nanoid'
export default {
    _id: {
        type: String,
        required: true,
        default: () => nanoid()
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    newEmail: {
        type: String,
        required: false,
    },
    isNewEmailVerified: {
        type: Boolean,
        required: false,
        default: false
    },
    password: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    isEmailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    otp: {
        type: Number,
        required: false,
    },
    token: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        default: 'active',
        required: false,
    },
}
