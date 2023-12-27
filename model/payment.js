const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paymentSchema = new mongoose.Schema({
	razorpay_order_id: {
		type: String,
		required: true,
	},
	razorpay_payment_id: {
		type: String,
		required: true,
	},
	razorpay_signature: {
		type: String,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
}, { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
