import * as core from '@actions/core'
import * as github from '@actions/github'

import { execute } from "./src"

export async function run(): Promise<void> {
  try {
    if (!process.env.GH_TOKEN) throw new Error('GH_TOKEN is not set')

    core.info(JSON.stringify(github.context.payload, undefined, 2))

    const githubToken = process.env.GH_TOKEN
    const repository: string[] = core.getInput('repository', { required: true }).split('/');
    const sourceBranch: string = core.getInput('source-branch', { required: true });
    const targetBranch: string = core.getInput('target-branch', { required: true });
    const label: string = core.getInput('label', { required: true });
    core.info(`Synchronizing branches and labels for repository ${repository.join('/')} from ${sourceBranch} to ${targetBranch} with label ${label}`)

    const runtime = execute({ githubToken, logger: core })
    await runtime.synchronizeBranchesAndLabels({ repository: { owner: repository[0], repo: repository[1] }, sourceBranch, targetBranch, label })
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

await run()
