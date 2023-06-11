

const getUserGigs = () => {
	let XML = new XMLHttpRequest();
	XML.open('get', '/userGigs');
	XML.onload = (e) => {
		let gigs = JSON.parse(e.target.response);
		let main_div = document.getElementById('main_courses');
		gigs.forEach(gig => {
			main_div.innerHTML += `<div class="col-lg-3 col-sm-6" onclick="window.open('/details?gigId=${gig._id}','_self')">
                                    <div class="item">
                                      <div class="thumb">
                                        <img src='${gig.Images[0]}' alt="" style="border-radius: 23px;">
                                      </div>
                                      <div class="down-content">
                                        <h4>${gig.Name}</h4>
                                        <span><a href='/showGig?gigId=${gig._id}'><i class="fa fa-eye"></i></a></span>
                                      </div>
                                    </div>
                                  </div>`
			console.log(gig);
		})
	}
	XML.send();
}
const loadAllgig = () => {
	let XML = new XMLHttpRequest();
	XML.open('get', '/alluserGigs');
	XML.onload = (e) => {
		let gigs = JSON.parse(e.target.response);
		let main_div = document.getElementById('main_courses');
		main_div.innerHTML ='';
		gigs.forEach(gig => {
			// console.log(`onclick="location.replace('/details/${gig._id}')"`)
			main_div.innerHTML += `<div class="col-lg-3 col-sm-6" onclick="window.open('/details?gigId=${gig._id}','_self')">
                                    <div class="item" >
                                      <div class="thumb">
                                        <img src='${gig.Images[0]}' alt="" style="border-radius: 23px;">
                                      </div>
                                      <div class="down-content">
                                        <h4>${gig.Name}</h4>
                                        <span><a href='/showGig?gigId=${gig._id}'><i class="fa fa-eye"></i></a></span>
                                      </div>
                                    </div>
                                  </div>`
		})
	}
	XML.send();
}
window.onload = getUserGigs;
