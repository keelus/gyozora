import { writable, derived } from 'svelte/store'
import type { models } from 'wailsjs/go/models.js';
import type { ActiveJob } from './activeJobsLogin';

export const USER_OS = writable('')
export const backHistory = writable<string[]>([])
export const forwardHistory = writable<string[]>([])
export const goBackEnabled = writable<boolean>(false)
export const goForwardEnabled = writable<boolean>(false)
export const previewProgress = writable<string>("100")
export const currentJob = writable<number>(-1)
export const CURRENT_PATH = writable<string>('')
export const CURRENT_PATH_BREADCRUMB_ELEMENTS = writable<models.SysFile[]>([])
export const activeJobs = writable<{[key:string]:ActiveJob}>({})
export const contents = writable<models.SysFile[]>([])
export const selectedFiles = writable<models.SysFile[]>([])
export const clipboardFiles = writable<models.SysFile[]>([])
export const settings = writable<{[key:string]:string}>({})
export const fileContextMenuOptions = writable<{[key:string]:{[key:string]:boolean}}>({	
	add:{show:true,disabled:false},
	open:{show:true,disabled:false},
	cut:{show:true,disabled:false},
	copy:{show:true,disabled:false},
	paste:{show:true,disabled:false},
	rename:{show:true,disabled:false},
	delete:{show:true,disabled:false},
	properties:{show:true,disabled:false}
})
export const languageDictionary = writable<{[key:string]:{[key:string]:string}}>({})