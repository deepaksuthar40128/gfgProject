let image=document.getElementById('image');

function load_img(){
	image.click();
}
image.addEventListener('change', () => {
	let photo = image.files[0];
	const reader = new FileReader();
		reader.readAsDataURL(photo);
		reader.onload = () => {
			let val = reader.result;
			document.getElementsByClassName('icon')[0].children[0].innerHTML=`<img src='${val}' alt="" srcset="">`
		}
})



