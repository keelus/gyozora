<script lang="ts">
import { get } from "svelte/store";
import { activeJobs } from "./store";
import { JobType, type ActiveJob, AddJob } from "./activeJobsLogin";
import Icon from 'svelte-icons-pack/Icon.svelte';

import VscPreview from "svelte-icons-pack/vsc/VscPreview";
import FiTrash from "svelte-icons-pack/fi/FiTrash";
import FaSolidPaste from "svelte-icons-pack/fa/FaSolidPaste"

let _activeJobs : {[key:string]:ActiveJob} = {}
let _activeJobsAmount = 0;
// activeJobs.update(aJobs => {
// 	return {}
// })
// const job1 = AddJob("Pasting files", 30, "8 files failed", JobType.PASTE)
// const job2 = AddJob("Deleting files", 60, "...", JobType.DELETE)
// const job3 = AddJob("Rendering", 90, "...", JobType.RENDER)
let sub = activeJobs.subscribe((val) => {
	_activeJobs = val;
	_activeJobsAmount = Object.keys(val).length;
})

export let opened : boolean = false;
</script>

<div class="activeJobs {opened ? "opened" : ""}">
	<div class="top">
		<div class="title">Active jobs [{_activeJobsAmount}]</div>
	</div>
	<div class="jobs">
		{#if _activeJobsAmount == 0}
			<div class="noJobs">There are no jobs running right now.</div>
		{/if}
		{#each Object.entries(_activeJobs) as [key, value]}
			<div class="job">
				<div class="left">
					<Icon src={value.jType === JobType.PASTE ? FaSolidPaste : (value.jType === JobType.DELETE ? FiTrash : VscPreview )} className="icon add" />
				</div>
				<div class="middle">
					<div class="title">{value.title}</div>
					<div class="additional">{value.additional}</div>
				</div>
				{#if value.progress !== -1}
					<div class="right">
						<div class="progress" style="--progress:{value.progress}%;">
							<div class="progressCircle">
								<div class="text">{Math.round(value.progress)}%</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>