import { $, type ShellPromise } from "bun"

type Checkout = (branch: string, options?: { pull?: boolean, create?: boolean }) => Promise<void>
const checkout: Checkout = async (branch, { pull = false, create = false } = {}) => {
  const checkoutOptions = create ? "-b" : ""
  await run($`git checkout ${checkoutOptions} ${branch}`)
  pull && (await run($`git pull`))
}

type CreateBranch = (branch: string) => Promise<void>
const createBranch: CreateBranch = async (branch: string) => checkout(branch, { create: true })

type Merge = (branch: string) => Promise<void>
const merge: Merge = async branch => { await run($`git merge origin/${branch} --no-verify`) }

type AbortMerge = () => Promise<void>
const abortMerge: AbortMerge = async () => { await run($`git merge --abort`) }

type PushForce = (branch: string) => Promise<void>
const pushForce: PushForce = async branch => { await run($`git push --force --set-upstream origin ${branch}`) }

const run = async (command: ShellPromise, errorMessage?: string): Promise<string> => {
  const { stdout, stderr, exitCode } = await command.quiet()
  const cleanMessage = [errorMessage, stderr.toString()].filter(Boolean).join(": ")
  if (exitCode) throw new Error(cleanMessage)
  return stdout.toString().trim()
}

export { abortMerge, checkout, createBranch, merge, pushForce }
