const express = require('express');
const Trainer = require('../model/trainer.js')
const Gig = require('../model/gigs.js')
const app = express();
const multer = require('multer');
const gigs = require('../model/gigs.js');
const undirectedRoutes = require('./undirectedRoutes.js');
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

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./static/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, `gfg${Date.now() + file.originalname}`);
	},
});
const upload = multer({ storage: storage });

app.post('/addgig', checkAuth, upload.array('photos', 12), async (req, res) => {
	try {
		const { price, tags, desc } = req.body;
		let Tags = tags.split(',');
		let files = req.files;
		let file_names = [];
		file_names =
			files.map((file) => {
				return `./uploads/${file.filename}`
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
		const usr=await user.findById(req.user._id);
		if(!usr){
			res.status(404).json({
				message:"User not Found"
			})
		}
		const oldTrainer = await Trainer.findOne({ email: req.user.email });
		if (oldTrainer) {
			req.flash('error_messages', "You Already a Trainer");
			res.redirect('/profile');
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
		usr.isTrainer=true;
		await usr.save();
		await user.findByIdAndUpdate(req.user._id, {
			profile: `./uploads/${req.file.filename}`
		});
		res.redirect('/addgig');
	} catch (error) {
		console.log(error)
		res.status(500).render(error)
	}
})

app.get('/editProfile',async(req,res)=>{
	try {
		const usr=await user.findById(req.user._id);
		if(usr.isTrainer){
            res.render('editProfile',{Traner:true,person:await Trainer.findOne({email: req.user.email})})
		}else{
			res.render('editProfile',{Traner:false,person:req.user});
		}
	} catch (error) {
		console.log(error)
		res.status(500).render(error)
	}
})

app.post('/modifyProfile',upload.single('image'), async (req, res) => {
	try {
	  let usr = await user.findById(req.user._id);
	  if (usr.isTrainer) {
		let trainer = await Trainer.findOne({ email: req.user.email });
		await trainer.updateOne({
		  experiance: req.body.experiance,
		  speslity: req.body.speslity,
		  achivement: req.body.achivement,
		  phone: req.body.phone
		});
		await trainer.save();
		await usr.findByIdAndUpdate(req.user._id, {
			profile: `./uploads/${req.file.filename}`
		});
	  } else {
		usr.username = req.body.username;
		usr.profile = `./uploads/${req.file.filename}`;
		await usr.save();
	  }
	  res.redirect('/auth');
	} catch (error) {
	  console.log(error);
	  res.status(500).render('error'); 
	}
  });
  
  app.use(undirectedRoutes);
  
  module.exports = app;
  