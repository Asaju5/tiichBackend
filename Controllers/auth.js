import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import { nanoid } from "nanoid";

const awsConfig = {
  accessKeyId: process.env.ASW_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send({ mgs: "Email exist already" });
    if (!name || !email || !password)
      return res.status(400).send({ msg: "Please enter all fields" });
    if (!validateEmail(email))
      return res.status(400).send({ msg: "Invalid email" });
    if (password.length < 8)
      return res
        .status(400)
        .send({ msg: "Password must be at least 8 characters" });

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    res.status(400).send({ msg: err.message });
  }
};

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ validateEmail }).exec();
    if (!user) return res.status(400).send("No user found");
    const match = await comparePassword(password, user.password);
    if(!match) return res.status(400).send('Incorrect  Password')
    const token = jwt.sign({ _id: user._id }, process.env.JWT, {
      expiresIn: "7d",
    });
    user.password = undefined;
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true
    });
    res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try Again");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Signout Success" });
  } catch (err) {
    console.log(err);
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").exec();
    console.log("CURRENT USER", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const sendEmail = async (req, res) => {
  //console.log('send email using json response');
  //res.json({ok: true})
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["bamidelesimeon05@gmail.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
        <html>
        <h1>Reset Paaword Link</h1>
        <p>use this link to reset your password</p>
        </html>
        `,
        },
      },

      Subject: {
        Charset: "UTF-8",
        Data: "Password reset link",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();
  emailSent.then((data) => {
    console.log(data);
    res.json({ ok: true });
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const shortCode = nanoid(6).toUpperCase();
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    );
    if (!user) return res.status(400).send("User not found");
    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <html>
                  <h1>Reset password</h1>
                  <p>User this code to reset your password</p>
                  <h2 style="color:red;">${shortCode}</h2>
                  <i>tiich.com</i>
                </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset Password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();
    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    //console.log({email, code, newPassword});
    const hashedPassword = await hashPassword(newPassword);

    const user = User.findOneAndUpdate(
      {
        email,
        passwordResetCode: code,
      },
      {
        password: hashedPassword,
        passwordResetCode: "",
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
};
