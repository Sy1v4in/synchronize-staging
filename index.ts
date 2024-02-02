import * as core from '@actions/core'

import { synchronizeBranchesAndLabels } from "./src"

export async function run(): Promise<void> {
  try {
    const repository: string[] = core.getInput('repository', { required: true }).split('/');
    const sourceBranch: string = core.getInput('source-branch', { required: true });
    const targetBranch: string = core.getInput('target-branch', { required: true });
    const label: string = core.getInput('label', { required: true });

    await synchronizeBranchesAndLabels({ repository: { owner: repository[0], repo: repository[1] }, sourceBranch, targetBranch, label })
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

await run()
