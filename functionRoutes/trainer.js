const express = require('express');
const Trainer = require('../model/trainer.js')
const Gig = require('../model/gigs.js')
const app = express();
const multer = require('multer')
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk')
const gigs = require('../model/gigs.js');
const undirectedRoutes = require('./undirectedRoutes.js');
const trainer = require('../model/trainer.js');
const user = require('../model/user.js');
function checkAuth(req, res, next) {
	if (req.isAuthenticated()) {
		res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
		next();
	} else {
		req.flash('error_messages', "Please Login to continue !");
		res.redirect('/login');
	}
}

const s3 = new AWS.S3({
	accessKeyId: process.env.AWSKEY,
	secretAccessKey: process.env.AWSPASSWORD,
	region: 'us-west-2'
});

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'mydbms',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function (req, file, cb) {
			cb(null, Date.now().toString() + '-' + file.originalname)
		}
	})
})

app.post('/addgig', checkAuth, upload.array('photos', 12), async (req, res) => {
	try {
		const { price, tags, desc } = req.body;
		let Tags = tags.split(',');
		let files = req.files;
		let file_names = [];
		file_names =
			files.map((file) => {
				return file.location
			});
		let newGig = new gigs({
			Tags: Tags,
			Images: file_names,
			Name: req.body.name,
			price: price,
			discription: desc,
			Trainer: (await trainer.findOne({ email: req.user.email }))._id,
		})
		await newGig.save();
		res.redirect('/profile');
	} catch (err) {
		console.log(err);
	}
})
app.get('/addgig', checkAuth, async (req, res) => {
	let data = await Trainer.findOne({ email: req.user.email });
	if (!data) {
		req.flash('error_messages', "Please Complete your Profile first");
		res.redirect('/addtrainer');
	}
	else {
		res.render('addgig');
	}
})

app.get('/addtrainer', async (req, res) => {
	res.render('trainer');
})


app.post('/trainer/register', checkAuth, upload.single('image'), async (req, res) => {
	try {
		const { experiance, gender, speslity, achivement, medical } = req.body;
		const oldTrainer = await Trainer.findOne({ email: req.user.email });
		if (oldTrainer) {
			req.flash('error_messages', "You Already a Trainer");
			return res.redirect('/profile');
		}
		let trainer = new Trainer({
			email: req.user.email,
			experiance: experiance,
			gender: gender,
			speslity: speslity,
			achivement: achivement,
			medical: medical,
		})
		trainer = await trainer.save();
		await user.findByIdAndUpdate(req.user._id, {
			profile: req.file.location,
		});
		res.redirect('/addgig');
	} catch (error) { 
		req.flash('error_messages', "Something wrong from our side!");
		 res.redirect('/profile');
	}
})

app.use(undirectedRoutes);

module.exports = app;