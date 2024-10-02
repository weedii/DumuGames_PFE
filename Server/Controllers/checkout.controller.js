import { errorHandler } from "../Utils/error.js";
import generateSignature from "../Utils/generateSignature.js";
import axios from "axios";
import Stripe from "stripe";
import { getCardsIndividuals } from "./user.controller.js";
import UserModel from "../Models/user.model.js";
import { sendEmailTopUpWallet } from "../Utils/sendEmail.js";

export const checkOut = async (req, res, next) => {
  try {
    const { amount, items, userEmail, userName } = req.body;

    if (!amount || !items || !userEmail || !userName) {
      return next(errorHandler(400, "Missing Fields!"));
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // generate userID
    const uuid = crypto.randomUUID();

    //create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.RESULT_URL,
      cancel_url: process.env.PRODUCT_URL,
      customer_email: userEmail,
      client_reference_id: uuid,

      line_items: items.map((item) => ({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.type,
            description: `Region: ${item.region}, Amount: ${item.amount}`,
            images: [item.pictureURL],
          },
        },
        quantity: item.quantity,
      })),

      metadata: {
        isUser: "no",
        userName,
        userEmail,
        items: JSON.stringify(items),
        amount,
      },
    });

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, error));
  }
};

export const topUpWallet = async (req, res, next) => {
  try {
    const { userID, amount, userEmail, userName } = req.body;

    const user = await UserModel.findById(userID);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    //create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.USER_RESULT_URL,
      cancel_url: process.env.USER_CANCEL_URL,
      customer_email: userEmail,
      client_reference_id: userID,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(Number(amount) * 100),
            product_data: {
              name: "Top-up your DumuGames wallet",
              images: [
                "https://res.cloudinary.com/dh7z4jgpy/image/upload/v1726399520/g0iftk4sbowogv8umfvw.png",
              ],
            },
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, error));
  }
};

export const stripeWebHook = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      // send success response to stripe to not consider it as a failure then continue...
      res.status(200).send("Received");

      const session = event.data.object;
      const metadata = session.metadata;

      // if not a wholesaler
      if (metadata.isUser === "no") {
        getCardsIndividuals(
          metadata.userName,
          metadata.userEmail,
          JSON.parse(metadata.items),
          Number(metadata.amount)
        );
        return;
      }

      const userId = session.client_reference_id;
      const amount = session.amount_total / 100;

      // Find the user and update balance
      const user = await UserModel.findById(userId);
      if (user) {
        const newBalance = Math.round((user.balance + amount) * 100) / 100;
        user.balance = newBalance;
        await user.save();
        await sendEmailTopUpWallet(user, amount);
      }
    }
    return;
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return;
  }
};
