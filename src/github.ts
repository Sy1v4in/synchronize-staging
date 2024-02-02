import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest"
import { type Context } from "./types"

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type PullRequestsResponse = RestEndpointMethodTypes["pulls"]["list"]["response"]
type PullRequests = PullRequestsResponse["data"]
type PullRequest = ArrayElement<PullRequests>

type Repository = {
  owner: string
  repo: string
}

type BranchesToSynchronize = (repository: Repository, label: string) => Promise<string[]>

const github = ({ githubToken }: Context) => {
  const branchesToSynchronize: BranchesToSynchronize = async (repository, label) => {
    const octokit = new Octokit({ auth: githubToken })

    const pullRequests: PullRequestsResponse = await octokit.rest.pulls.list(repository)
    return pullRequests.data.filter(isOnTargetBranch(label)).map(branchName)
  }

  const isOnTargetBranch = (labelName: string) => (pr: PullRequest): boolean =>
    pr.labels.some(label => label.name === labelName)

  const branchName = (pr: PullRequest): string => pr.head.ref

  return {
    branchesToSynchronize,
  }
}

export { github }
