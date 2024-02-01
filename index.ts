import * as core from '@actions/core'

import { synchronizeBranchesAndLabels } from "./src"

export async function run(): Promise<void> {
  try {
    const repository: string[] = core.getInput('repository').split('/');
    const sourceBranch: string = core.getInput('source-branch');
    const targetBranch: string = core.getInput('target-branch');
    const label: string = core.getInput('label');

    await synchronizeBranchesAndLabels({ repository: { owner: repository[0], repo: repository[1] }, sourceBranch, targetBranch, label })
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

await run()
