import { $, type ShellPromise } from "bun"

type CurrentBranch = () => Promise<string>
const currentBranch: CurrentBranch = async () => run($`git branch --show-current`)

type EnsureCleanLocalRepo = () => Promise<void>
const ensureCleanLocalRepo: EnsureCleanLocalRepo = async () => {
  await run($`git diff --quiet`, "There are uncommitted changes, don't use this script on a dirty repository")
}

type Checkout = (branch: string, options?: { pull?: boolean, create?: boolean }) => Promise<void>
const checkout: Checkout = async (branch, { pull = false, create = false } = {}) => {
  const checkoutOptions = create ? "-b" : ""
  await run($`git checkout ${checkoutOptions} ${branch}`)
  pull && (await run($`git pull`))
}

type CreateBranch = (branch: string) => Promise<void>
const createBranch: CreateBranch = async (branch: string) => {
  await run($`git branch -D ${branch}`)
  await checkout(branch, { create: true })
}

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

export { abortMerge, checkout, createBranch, currentBranch, ensureCleanLocalRepo, merge, pushForce }
