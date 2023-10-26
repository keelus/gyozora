
export const enum JobType {
    PASTE = 0,
    DELETE,
    RENDER
}

interface ActiveJob {
	title: string,
	progress: number,
	jType: JobType,
	additional: string
}

export type {ActiveJob as ActiveJob}
import { activeJobs } from './store'

export function AddJob(title : string, progress : number, additional : string, jobType : JobType) : string {
	let newID = Math.round(Math.random() * 100).toString()
	console.log("ADDING JOB. NEW ID =", newID)
	activeJobs.update(aJobs => {
		let newJob : ActiveJob = {title: title, progress:progress, additional: additional, jType: jobType}
		aJobs[newID] = newJob;
		return aJobs;
	})

	return newID
}

export function UpdateJob(jobID : string, newAdditional : string, newProgress : number) {
	activeJobs.update(aJobs => {
		if(jobID in aJobs) {
			aJobs[jobID].progress = newProgress
			aJobs[jobID].additional = newAdditional
		}

		return aJobs
	})
}

export function RemoveJob(jobID : string) {
	activeJobs.update(aJobs => {
		if(jobID in aJobs) {
			delete aJobs[jobID]
		}

		return aJobs
	})
}