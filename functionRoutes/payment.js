const express = require("express");
const Razorpay = require('razorpay');
const User = require("../model/user");
const Payment=require("../model/payment");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const bcrypt=require("bcryptjs");
const { default: mongoose } = require("mongoose");
const app = express();



function checkAuth(req, res, next) {
	if (req.isAuthenticated()) {
		res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
		next();
	} else {
		req.flash('error_messages', "Please Login to continue !");
		res.redirect('/login');
	}
}
const instance = new Razorpay({
	key_id: process.env.ROZAR_API_KEY,
	key_secret: process.env.ROZAR_SECRET_KEY,
});


app.get('/checkout',checkAuth, async (req, res) => {
	try {
		const options = {
			amount: Number(req.query.amount) * 100,
			currency: "INR",
		};
		const order = await instance.orders.create(options);
		let user = await User.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(req.user._id)
				}
			}, {
				$project: {
					username: 1,
					email: 1,
				}
			}
		])
		let token = jwt.sign({
            amount:req.query.amount,
            orderId: order.id
        }, process.env.JWT_KEY);
		res.cookie("order_details", token, { maxAge: 10 * 60 * 1000, httpOnly: true }).status(201).json({
			order: order, user: user
		})
	} catch (error) {
		res.status(500).json({
			message: "Internal Server Error",
		})
	}
})

app.post("/paymentverification",checkAuth, async (req, res) => {
	const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
	try {
		let check=await jwt.verify(req.cookies.order_details, process.env.JWT_KEY)
		if(!check){
			req.flash('error_messages', "something Went wrong !!");
			res.redirect('/');
		}
		const body = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSignature = crypto
			.createHmac("sha256", process.env.ROZAR_SECRET_KEY)
			.update(body.toString())
			.digest("hex");
		const isAuthentic = expectedSignature === razorpay_signature;

		const salt = await bcrypt.genSalt(10);
		if (isAuthentic) {
			await Payment.create({
				razorpay_order_id,
				razorpay_payment_id,
				razorpay_signature: await bcrypt.hash(razorpay_payment_id, salt),
				user:req.user._id,
			});
            
			 await User.findByIdAndUpdate(req.user._id, {
				$push: {
					gigs: req.query.gigId,
				}
			}, { new: true })
			
			req.flash('success_messages', "Payment Successfull");
			res.redirect('/');
		} else {
			req.flash('error_messages', "Something Went Wrong !");
			res.redirect(`/details?gigId=${req.query.gigId}`)
		}
	} catch (error) {
      res.status(500).json({
		success:false,
		error:"Internal Server Error",
	  })
	}

})

module.exports = app;