import mongoose from 'mongoose'

const {Schema} = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Please enter your name"],
    },

    email: {
        type: String,
        trim: true,
        required: [true, "Please enter your email"],
        unique: true
    },

    password: {
        type: String,
        trim: true,
        required: [true, "Please enter your password"],
        min: 8,
        max: 80
    },

    picture: {
        type: String,
        default: "/avatar.png",
    },

    role: {
        type: [String],
       default: ["Student"],
       enum: ['Student', 'Tutor', 'Admin']
    },

    stripe_account_id: "",
    stripe_seller: {},
    stripeSession: {},

    passwordResetCode: {
        data: String,
        default: "",
    }
}, {timestamps: true})


export default mongoose.model('User', userSchema)