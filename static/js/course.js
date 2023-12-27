window.onload = async () => {

	let data=await myGET("GET",'/courses');
	let gig=document.getElementById('topRatingGig');
	data.map((item)=>{
		gig.innerHTML+=`<li onclick="window.open('/details?gigId=${gig._id}','_self')">
		<img src="${item.Images[0]}" alt="" class="templatemo-item">
		<h4>${item.Name}</h4>
		<span><i class="fa fa-star" style="color: yellow;"></i>${item.Rating?item.Rating :'unrated'}</span>
		<span><i class="fas fa-shopping-bag"></i> ${item.NumberRates?item.NumberRates:0}</span>
		<div class="download">
		  <a href="/details?gigId=${item._id}" class="frontLink">shop Now</a>
		</div>
	  </li>`
	})


	let featureData=await myGET('GET','/featureGigs');
	let featueDiv=document.getElementById('feature');
	featureData.map((item)=>{
		featueDiv.innerHTML+=`<div class="item" onclick="window.open('/details?gigId=${gig._id}','_self')">
                    <div class="thumb">
                      <img src="${item.Images[0]}" alt="">
                      <div class="hover-effect">
                        <!-- <h6>2.4K Streaming</h6> -->
                      </div>
                    </div>
                    <<h4>${item.Name}</h4> 
                    <ul>
                      <li><i class="fa fa-star"></i> ${item.Rating?item.Rating:'unrated'}</li>
                      <li><i class="fas fa-shopping-bag"></i> ${item.NumberRates?item.NumberRates:0}</li>
                    </ul>
                  </div>`
	})


}

const loadAllCourse=async()=>{
	let data=await myGET("GET",'/Allcourses');
	let gig=document.getElementById('topRatingGig');
	gig.innerHTML='';
	data.map((item)=>{
		gig.innerHTML+=`<li>
		<img src="${item.Images[0]}" alt="" class="templatemo-item">
		<h4>${item.Name}</h4>
		<span><i class="fa fa-star" style="color: yellow;"></i>${item.Rating?item.Rating :'unrated'}</span>
		<span><i class="fas fa-shopping-bag"></i> ${item.NumberRates?item.NumberRates:0}</span>
		<div class="download">
		  <a href="/details" class="frontLink">shop Now</a>
		</div>
	  </li>`
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
