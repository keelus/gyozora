import { writable, derived } from 'svelte/store'

export const backHistory = writable([])
export const forwardHistory = writable([])
export const goBackEnabled = writable(false)
export const goForwardEnabled = writable(false)
export const previewProgress = writable("100")
export const currentJob = writable(-1)
export const CURRENT_PATH = writable('')
export const contents = writable([])
export const selectedFiles = writable([])
export const fileContextMenuOptions = writable({	
	add:{show:true,disabled:false},
	open:{show:true,disabled:false},
	cut:{show:true,disabled:false},
	copy:{show:true,disabled:false},
	paste:{show:true,disabled:false},
	rename:{show:true,disabled:false},
	delete:{show:true,disabled:false},
	properties:{show:true,disabled:false}
})