import User from "../models/User";
const stripe = require("stripe");
import queryString from "query-string";

export const becomeTutor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    if (user) {
      const account = await stripe.accounts.create({ type: "standard" });
      user.stripe_account_id = account.id;
      user.save();
    }

    // let accountLink = await stripe.accountLinks.create({
    //   account: user.stripe_account_id,
    //   refresh_url: process.env.STRIPE_REDIRECT_URL,
    //   return_url: process.env.STRIPE_REDIRECT_URL,
    //   type: "account_onboarding",
    // });

    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });

    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (err) {
    console.log("MAKE INSTRUCTOR ERR ", err);
  }
};

export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    //console.log("ACCOUNT => ", account);
    if (!account.charges_enabled) {
      return res.staus(401).send("Unauthorized");
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          $addToSet: { role: "Tutor" },
        },
        { new: true }
      )
        .select("-password")
        .exec();
      res.json(statusUpdated);
    }
  } catch (err) {
    console.log(err);
  }
};


export const currentInstructor = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password").exec();
    if (!user.role.includes("Tutor")) {
      return res.sendStatus(403)
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};
