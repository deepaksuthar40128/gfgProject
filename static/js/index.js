// 	  <h4>'${item.Trainer?.username}'<br><span>Shop Now</span></h4>

window.onload = async () => {
	let data = await myGET('GET', '/gigs');
	let gigDiv = document.getElementById('userGig');
	data.map((item) => {
		gigDiv.innerHTML += ` <div class="col-lg-3 col-sm-6" style="width: 28%;">
	  <div class="item">
	  <div><img src="${item.Images[0]}" alt=""></div>
	  <div class="gigChk">
	  <ul>
		<li><i class="fa fa-star"></i>${item.Rating?item.Rating:'unrated'}</li>
		<li><i class="fa fa-users"></i><span style="color: white;">${item.NumberRates?item.NumberRates :0}</span></li>
        <li><i class="fa fa-dollar-sign"></i><span style="color: white;">${item.price}</span></li>
	  </ul>
	  </div>
	  <div>
	  <h4><i class="fa fa-chalkboard-teacher" style="margin-right: 10px;"></i>${item.Trainer?.username || 'Ram'}</h4>
	  <a herf="/details?gigId=${item._id}" class="frontLink">Shop Now</a>
	  </div>
	</div>
  </div>`
		
	})
}

const myGET = (method, url, data) => {
	return new Promise((resolve, reject) => {
		try {
			let XML = new XMLHttpRequest();
			XML.open(method, url);
			XML.setRequestHeader('Content-Type', 'application/json');
			XML.onload = (e) => {
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
