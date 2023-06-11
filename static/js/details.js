window.onload = async () => {
	let gigId = location.href.split('?')[1].split('=')[1];
	let data = await myGET("GET",`/details/${gigId}`);
	console.log(data);
	document.getElementById('feature-left').innerHTML = ` <img src="${data.Images[0]}" alt="" style="border-radius: 23px;">`
	document.getElementById('desc').innerText = data.discription;
	document.getElementById('gigName').innerText = data.Name;
	document.getElementsByClassName('box_4')[0].innerText = data.price;
	document.getElementsByClassName('box_1')[0].innerText = data.Rating ? data.Rating : "Unrated";
	document.getElementsByClassName('box_2')[0].innerText = data.NumberRates ? data.NumberRates : 0;
	document.getElementsByClassName('box_3')[0].innerHTML += `<a href='#' class="logo">Owner</a>`
	document.getElementById('shop_btn').innerHTML = data.isBuy ?  `<div id="ratingDiv">
	                                                                <div class="rate" id="rateValue">
	                                                                 <div onclick ="rateGig(1,'${data._id}')" class="stars">★</div>
                                                                     <div onclick ="rateGig(2,'${data._id}')" class="stars">★</div>
                                                                     <div onclick ="rateGig(3,'${data._id}')" class="stars">★</div>
                                                                     <div onclick ="rateGig(4,'${data._id}')" class="stars">★</div>
                                                                     <div onclick ="rateGig(5,'${data._id}')" class="stars">★</div>
                                                                 </div> 
																</div>`: `<a href="/payment">Shop Now</a>`
	data.Images.map(img => {
		document.getElementById('extra_img').innerHTML += `<div class="col-lg-4" style="margin-bottom:20px">
		<img src="${img}" alt="" style="border-radius: 23px; margin-bottom: 30px; margin-top: 30px; height:100%;">
	  </div>`
	})


	let rdata = await LoadRecomendationGig(data.Tags);
	rdata.map(async data2 => {
		gig = await myGET(`/gig/${data2[0]}`);
		document.getElementById('reconmondGigs').innerHTML += `<div class="col-lg-6">
		<div class="item">
		  <img src="${gig.Images[0]}" alt="" class="templatemo-item">
		  <h4>${gig.Name}</h4>
		  <ul>
		  <li><i class="fa fa-star"></i><span>${gig.Rating ? gig.Rating : "Unrated"}</span></li>
		</ul>
		</div>
	  </div>`
	})
}


let rateVale;
const rateGig = (num,id) => {
	rateVale=num;
	let stars = document.getElementById('rateValue');
	let RateDiv=document.getElementById('ratingDiv')
	for (let i = 0; i < 5; i++) {
		stars.children[i].style.color = 'white';
	}
	for (let i = 0; i < num; i++) {
		stars.children[i].style.color = 'yellow';
	}
	myGET('POST',`/rating/${id}`,{rating:num}).then(()=>{
		RateDiv.style.display=none;
	}).catch((err)=>{
		console.log(err);
	});
}

const LoadRecomendationGig = async (tags) => {
	return new Promise(async (Resolve, Reject) => {
		if (tags.length) {
			let query = tags.join(',');
			let data = await myGET(`/recomendGigs?tags=${query}`);
			Resolve(data);
		}
	})
}


const myGET = (method, url, data) => {
	return new Promise((resolve, reject) => {
	  try {
		let XML = new XMLHttpRequest();
		XML.open(method, url);
		XML.setRequestHeader('Content-Type', 'application/json'); 
		XML.onload = (e) => {
			console.log(e.target.response);
		  let data = JSON.parse(e.target.response);
		  resolve(data);
		}
		XML.onerror = (err) => {
		  reject(err);
		}
		XML.send(JSON.stringify(data)); 
	  } catch (err) {
		reject(err);
	  }
	});
  }
  


let ratingbox = document.getElementsByClassName('rate')[0];
