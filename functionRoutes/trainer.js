const express = require('express');
const Trainer = require('../model/trainer.js')
const Gig = require('../model/gigs.js')
const app = express();
const sharp=require('sharp');
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
		const Tags = tags.split(',');
		const files = req.files;
		let file_names = [];

		for (const file of files) {
			const compressedImageBuffer = await compressAndResizeImage(file.path);
			const filename = `gfg${Date.now() + file.originalname}`;
			const filePath = `./static/uploads/${filename}`;
			await sharp(compressedImageBuffer).toFile(filePath);

			file_names.push(filePath);
		}
		
		file_names =
		file_names.map((file) => {
			let subFile=file.substring(8)
				return `.${subFile}`
			});

		const newGig = new gigs({
			Tags: Tags,
			Images: file_names,
			Name: req.body.name,
			price: price,
			discription: desc,
			Trainer: (await Trainer.findOne({ email: req.user.email }))._id,
		});

		await newGig.save();
		res.redirect('/profile');
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

// Function to compress and resize image
const compressAndResizeImage = async (filename) => {
	try {
		const maxWidth = 500;
		let targetWidth = 100, targetHeight = 100;
		let imgmaintaineRatio = true;

		if (imgmaintaineRatio) {
			const [originalWidth, originalHeight] = await calculateImageDimensions(filename);
			const originalAspectRatio = originalWidth / originalHeight;
			if (originalAspectRatio > 1) {
				targetWidth = maxWidth;
				targetHeight = Math.floor(maxWidth / originalAspectRatio);
			} else {
				targetHeight = maxWidth;
				targetWidth = Math.floor(maxWidth * originalAspectRatio);
			}
		}

		return await sharp(filename)
			.resize(targetWidth, targetHeight)
			.toBuffer();
	} catch (error) {
		console.error('Error compressing and resizing image:', error);
		throw error;
	}
};

// Function to calculate image dimensions
const calculateImageDimensions = async (filename) => {
	try {
		const image = sharp(filename);
		const metadata = await image.metadata();
		const orientation = metadata.orientation || 1;
		let { width, height } = metadata;
		if (orientation >= 5 && orientation <= 8) {
			[width, height] = [height, width];
		}
		return [width, height];
	} catch (error) {
		console.error('Error calculating image dimensions:', error);
		throw error;
	}
};

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
		const { experiance, gender, speslity, achivement, medical, username } = req.body;
		const usr = await user.findById(req.user._id);
		if (!usr) {
			res.status(404).json({
				message: "User not Found"
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
			username: username,
		})
		trainer = await trainer.save();
		usr.isTrainer = true;
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

app.get('/editProfile', async (req, res) => {
	try {
		const usr = await user.findById(req.user._id);
		if (usr.isTrainer) {
			res.render('editProfile', { Traner: true, person: await Trainer.findOne({ email: req.user.email }) })
		} else {
			res.render('editProfile', { Traner: false, person: req.user });
		}
	} catch (error) {
		console.log(error)
		res.status(500).render(error)
	}
})

app.post('/modifyProfile', upload.single('image'), async (req, res) => {
	try {
		let usr = await user.findById(req.user._id);
		if (usr.isTrainer) {
			let trainer = await Trainer.findOne({ email: req.user.email });
			await trainer.updateOne({
				experiance: req.body.experiance,
				speslity: req.body.speslity,
				achivement: req.body.achivement,
				phone: req.body.phone,
				username: req.body.username,
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
		res.redirect('/profile');
	} catch (error) {
		console.log(error);
		res.status(500).render('error');
	}
});

app.get('/tranerProfile/:id', async (req, res) => {

})
app.use(undirectedRoutes);

module.exports = app;
