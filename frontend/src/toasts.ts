import toast from 'svelte-french-toast';

export function GenerateToast(type : string, text : string, emoji : string) {
	const modalPosition = "bottom-right"

	let backgroundColor = "rgba(97, 170, 207, 1)"
	let borderColor = "rgba(97, 170, 207, 1)"

	if(type == "success"){
		backgroundColor = "rgba(0, 100, 0, 1)"
		borderColor = "rgba(21, 207, 14, .3)"
	} else if (type == "error") {
		backgroundColor = "rgba(100, 0, 0, 1)"
		borderColor = "rgba(207, 14, 14, .3)"
	}


	toast(text, {
		icon: emoji,
		position: modalPosition,
		style: `border-radius:4px;background:${backgroundColor}; border: 1px solid ${borderColor}; color: white;`,
	});
}