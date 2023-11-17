<script lang="ts">
import { get } from "svelte/store";
import { activeJobs, languageDictionary, settings } from "../utils/store";
import { JobType, type ActiveJob, AddJob } from "../utils/activeJobsLogin";
import Icon from "@iconify/svelte";
import { GetIconByType } from "../utils/icons";
  import { GetWord } from "../utils/languages";

let _activeJobs : {[key:string]:ActiveJob} = {}
let _activeJobsAmount = 0;
// activeJobs.update(aJobs => {
// 	return {}
// })
// const job2 = AddJob("Deleting files", -1, "", JobType.DELETE)
let sub = activeJobs.subscribe((val) => {
	_activeJobs = val;
	_activeJobsAmount = Object.keys(val).length;
})
export let opened : boolean = false;

$: lang = $settings && $languageDictionary

</script>

<div class="activeJobs {opened ? "opened" : ""}">
	<div class="top">
		<div class="title">{lang && GetWord("jobsTitle")} [{_activeJobsAmount}]</div>
	</div>
	<div class="jobs">
		{#if _activeJobsAmount == 0}
			<div class="noJobs">{lang && GetWord("jobsEmpty")}</div>
		{/if}
		{#each Object.entries(_activeJobs) as [key, value]}
			<div class="job">
				<div class="left">
					<Icon icon={GetIconByType(value.jType === JobType.PASTE ? "jobPaste" : (value.jType === JobType.DELETE ? "jobDelete" : "jobRender" ))} class="icon"/>
				</div>
				<div class="middle">
					<div class="title">{value.title}</div>
					<div class="additional">{value.additional}</div>
				</div>
				<div class="right">
					{#if value.progress === -1}
						<div class="endlessLoader"></div>
					{:else}
						<div class="progress" style="--progress:{value.progress}%;">
							<div class="progressCircle">
								<div class="text">{Math.round(value.progress)}%</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>