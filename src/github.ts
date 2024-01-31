import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest"

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type PullRequestsResponse = RestEndpointMethodTypes["pulls"]["list"]["response"]
type PullRequests = PullRequestsResponse["data"]
type PullRequest = ArrayElement<PullRequests>

type Repository = {
  owner: string
  repo: string
}

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
})

type BranchesToSynchronize = (repository: Repository, label: string) => Promise<string[]>
const branchesToSynchronize: BranchesToSynchronize = async (repository, label) => {
  const pullRequests: PullRequestsResponse = await octokit.rest.pulls.list(repository)
  return pullRequests.data.filter(isOnTargetBranch(label)).map(branchName)
}

const isOnTargetBranch = (labelName: string) => (pr: PullRequest): boolean =>
  pr.labels.some(label => label.name === labelName)

const branchName = (pr: PullRequest): string => pr.head.ref

export { branchesToSynchronize }
