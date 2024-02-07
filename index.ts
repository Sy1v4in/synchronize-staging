import { execute } from "./src"
import { parseArgs } from "util"

export async function run(): Promise<number> {
  try {
    if (!process.env.GH_TOKEN) throw new Error('GH_TOKEN is not set')

    const { values: inputs } = parseArgs({
      args: Bun.argv,
      options: {
        repository: { type: 'string' },
        'source-branch': { type: 'string' },
        'target-branch': { type: 'string' },
        label: { type: 'string' },
      },
      strict: true,
      allowPositionals: true,
    })
    if (!inputs['repository']) throw new Error('repository is required')
    if (!inputs['source-branch']) throw new Error('source-branch is required')
    if (!inputs['target-branch']) throw new Error('target-branch is required')
    if (!inputs['label']) throw new Error('label is required')

    const githubToken = process.env.GH_TOKEN
    const repository: string[] = inputs.repository.split('/');
    const sourceBranch: string = inputs['source-branch']
    const targetBranch: string = inputs['target-branch']
    const label: string = inputs.label
    console.info(`Synchronizing branches and labels for repository ${repository.join('/')} from ${sourceBranch} to ${targetBranch} with label ${label}`)

    const runtime = execute({ githubToken, logger: console })
    await runtime.synchronizeBranchesAndLabels({ repository: { owner: repository[0], repo: repository[1] }, sourceBranch, targetBranch, label })
  } catch (error) {
    console.info(error);
    return -1
  }
  return 0
}

const status = await run()
process.exit(status)
