let tags = document.getElementsByClassName('tags');
let total_tags = 5;
let tag_values = [];
Array.from(tags).forEach((tag) => {
	tag.addEventListener('click', () => {
		if (tag.classList.contains('selected')) {
			tag.classList.remove('selected');
			removeItemOnce(tag_values, tag.innerHTML);
			total_tags++;
		}
		else {
			if (total_tags == 0) {
				alert("no more tags");
				return;
			}
			tag.classList.add('selected');
			tag_values.push(tag.innerHTML);
			total_tags--;
		}
	})
})



function removeItemOnce(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

let photos_input = document.getElementById('photos');
let form = document.getElementById('myform')
form.addEventListener('submit', (e) => {
	e.preventDefault();
	form.tags.value = tag_values.join(',');
	form.submit();
})


function load_img() {
	photos_input.click();
}

photos_input.addEventListener('change', () => {
	let photos = photos_input.files;
	Array.from(photos).forEach((photo) => {
		const reader = new FileReader();
		reader.readAsDataURL(photo);
		reader.onload = () => {
			let val = reader.result;
			document.getElementsByClassName('images')[0].innerHTML+=`<div class="img"> <span>X</span> <img src='${val}' alt="" srcset=""></div>`
		}
	})
})