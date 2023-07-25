const express = require("express");
const Gigs = require("../model/gigs");
const trainer = require("../model/trainer");
const user = require("../model/user");
const mongoose = require("mongoose");
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



app.get('/userGigs', checkAuth, async (req, res) => {
	try {
		let data = await Gigs.aggregate([
			{
				$match: {
					'Trainer': (await trainer.findOne({ email: req.user.email }))._id,
				}
			},
			{
				'$sort': {
					'createdAt': -1
				}
			}, {
				'$limit': 4
			}
		]);
		res.status(200).json(data);
	} catch (err) {
		res.status(500).json(err);
	}
})
app.get('/alluserGigs', checkAuth, async (req, res) => {
	try {
		let data = await Gigs.aggregate([
			{
				$match: {
					'Trainer': (await trainer.findOne({ email: req.user.email }))._id,
				}
			}, {
				'$sort': {
					'createdAt': -1
				}
			}
		]);
		res.status(200).json(data);
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
})

app.get('/buy/:id', checkAuth, async (req, res) => {
	data = await user.findByIdAndUpdate(req.user._id, {
		$push: {
			gigs: req.params.id,
		}
	}, { new: true })
	res.json(data)
})


app.get('/details/:id', checkAuth, async (req, res) => {
	try {
		let data = await Gigs.findById(req.params.id).populate('Trainer');
		data = data._doc;
		let user_gigs = req.user.gigs;
		if (user_gigs.includes(data._id)) {
			data["isBuy"] = true;
		} else
			data["isBuy"] = false;
		res.status(200).json(data);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

app.get('/recomendGigs', async (req, res) => {
	try {
		let Tags2 = req.query.tags.split(',');

		data = await Promise.all(Tags2.map(async tag => {
			data2 = await Gigs.aggregate([
				{
					$match: {
						Tags: {
							$elemMatch: {
								$eq: tag
							}
						}
					}
				}, {
					$project: {
						_id: 1
					}
				}
			])
			return data2;
		}))
		let nanda = {};

		data.map(arr => {
			arr.map(ele => {
				if (ele._id in nanda) {
					nanda[ele._id]++;
				} else {
					nanda[ele._id] = 1;
				}
			})
		})
		let sortable = [];
		for (let vehicle in nanda) {
			sortable.push([vehicle, nanda[vehicle]]);
		}

		sortable.sort(function (a, b) {
			return -(a[1] - b[1]);
		});
		res.json(sortable);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);

	}
})

app.get('/gig/:id', async (req, res) => {
	let gig = await Gigs.findById(req.params.id);
	res.status(200).json(gig);
})


app.get('/payment', async (req, res) => {
	res.render('payment');
})

app.post('/rating/:id', async (req, res) => {
	try {
		const { rating } = req.body;
		let gig = await Gigs.findById(req.params.id);
		if (!gig) {
			return res.json({ err: "Gig Not Found" });
		}

		let prevRating = gig.Rating ? gig.Rating : 0;
		let prevNumRates = gig.NumberRates ? gig.NumberRates : 0;
		let total = prevNumRates * prevRating + rating;
		let newRating = total / (prevNumRates + 1);

		gig.Rating = newRating;
		gig.NumberRates = prevNumRates + 1;
		gig.save();

		return res.json({ msg: "rating updated" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
})

app.get('/gigs', async (req, res) => {
	try {
		let usr = await user.findById(req.user._id);
		let gigTag = new Set();

		if (!usr.gigs.length) {
			let gig = await Gigs.find().limit(4);
			return res.status(200).json(gig);
		} else {
			await Promise.all(usr.gigs.map(async (item) => {
				let gig = await Gigs.findById(item);
				gig.Tags.forEach(element => {
					gigTag.add(element);
				});
			}));
		}

		gigTag = [...gigTag];
		data = await Promise.all(gigTag.map(async (tag) => {
			data2 = await Gigs.aggregate([
				{
					$match: {
						Tags: {
							$elemMatch: {
								$eq: tag
							}
						}
					}
				}, {
					$project: {
						_id: 1
					}
				}
			]);
			return data2;
		}));

		let nanda = {};
		data.map(arr => {
			arr.map(ele => {
				if (usr.gigs.indexOf(ele._id) == -1) {
					if (ele._id in nanda) {
						nanda[ele._id]++;
					} else {
						nanda[ele._id] = 1;
					}
				}
			})
		})
		let sortable = [];
		for (let vehicle in nanda) {
			sortable.push([vehicle]);
		}

		let filterGig = [];
		await Promise.all(sortable.map(async (item) => {
			let gig = await Gigs.findById(item).populate('Trainer');
			filterGig.push(gig);
		}));
		res.json(filterGig);
	} catch (error) {
		console.log(error);
	}
});


app.get('/limitedGig', async (req, res) => {
	try {
		let usr = await user.findById(req.user._id);
		let gigTag = new Set();

		if (!usr.gigs.length) {
			let gig = await Gigs.find().limit(2);
			return res.status(200).json(gig);
		} else {
			await Promise.all(usr.gigs.map(async (item) => {
				let gig = await Gigs.findById(item);
				gig.Tags.forEach(element => {
					gigTag.add(element);
				});
			}));
		}

		gigTag = [...gigTag];
		data = await Promise.all(gigTag.map(async (tag) => {
			data2 = await Gigs.aggregate([
				{
					$match: {
						Tags: {
							$elemMatch: {
								$eq: tag
							}
						}
					}
				}, {
					$project: {
						_id: 1
					}
				}
			]);
			return data2;
		}));

		let nanda = {};
		data.map(arr => {
			arr.map(ele => {
				if (usr.gigs.indexOf(ele._id) == -1) {
					if (ele._id in nanda) {
						nanda[ele._id]++;
					} else {
						nanda[ele._id] = 1;
					}
				}
			})
		})
		let sortable = [];
		for (let vehicle in nanda) {
			sortable.push([vehicle]);
		}

		let filterGig = [];
		await Promise.all(sortable.map(async (item) => {
			let gig = await Gigs.findById(item).populate('Trainer');
			filterGig.push(gig);
		}));
		res.json(filterGig);
	} catch (error) {
		console.log(error);
	}
});

app.get('/courses', async (req, res) => {
	try {
		let gigs = await Gigs.aggregate([{
			$sort: {
				Rating: -1
			}
		}, {
			$limit: 3
		}])
		res.status(200).json(gigs);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
})
app.get('/Allcourses', async (req, res) => {
	try {
		let gigs = await Gigs.aggregate([{
			$sort: {
				Rating: -1
			}
		}])
		res.status(200).json(gigs);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
})

app.get('/featureGigs', async (req, res) => {
	try {
		let tagArr = ['ABS', 'Full Body', 'Working', 'Chest', 'Legs', 'Upper Part', 'Lower Part', 'Shoulder', 'Weight Loose', 'Weight Gain', 'Over All', 'Lower Part']
		data = await Promise.all(tagArr.map(async tag => {
			data2 = await Gigs.aggregate([
				{
					$match: {
						Tags: {
							$elemMatch: {
								$eq: tag
							}
						}
					}
				}, {
					$project: {
						_id: 1
					}
				}
			])
			return data2;
		}))
		let uniquGig = [];
		data.forEach((gig) => {
			gig.forEach((item) => {
				let id = (item._id).toString();

				if (!uniquGig.includes(id)) {
					uniquGig.push(id);
				}
			});
		});
		uniquGig = uniquGig.map(element => {
			return mongoose.Types.ObjectId(element);
		});
		uniquGig = uniquGig.filter((gig) => gig !== undefined);

		let overGig = await Promise.all(uniquGig.map(async (item) => {
			let gig = await Gigs.findById(item);
			return gig;
		}));


		overGig = overGig.filter((gig) => gig !== undefined);

		res.status(200).json(overGig);


	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
})


app.get('/searchGig/', async (req, res) => {
	try {
		let gigs = await Gigs.aggregate([
			{
				'$match': {
					$or: [
						{
							'Tags': {
								'$elemMatch': {
									'$in': [
										new RegExp(req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
									]
								}
							}
						},
						{
							'Name':  {
								'$elemMatch': {
									'$in': [
										new RegExp(req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
									]
								}
							}
						}
					]

				}
			}, {
				$project: {
					"Name": 1
				}
			}, {
				$limit: 10
			}
		]).exec();
		gigs = gigs.map(gig => {
			return {
				...gig,
				type: "gig",
			}
		})

		let trainers = await trainer.aggregate([
			{
				$match: {
					"username":new RegExp(req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
				}
			}, {
				$project: {
					"username": 1
				}
			}, {
				$limit: 10
			}
		])
		trainers = trainers.map(tra => {
			return {
				...tra,
				type: "trainer",
			}
		})
		let searchData = [...gigs, ...trainers]
		res.json(searchData);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});


module.exports = app;
