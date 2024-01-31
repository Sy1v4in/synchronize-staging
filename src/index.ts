import { abortMerge, checkout, createBranch, currentBranch, ensureCleanLocalRepo, merge, pushForce } from './git'
import { branchesToSynchronize } from './github'

type Repository = {
  owner: string
  repo: string
}
type SynchronizeBranchesAndLabels = (params: {
  repository: Repository
  sourceBranch: string
  targetBranch: string
  label: string
}) => Promise<void>

const synchronizeBranchesAndLabels: SynchronizeBranchesAndLabels = async ({ repository, sourceBranch, targetBranch, label }) => {
  await ensureCleanLocalRepo()
  const previousBranch = await currentBranch()

  console.log(`Checking out ${sourceBranch} and pulling`)
  await checkout(sourceBranch, { pull: true })
  console.log(`Creating ${targetBranch} branch`)
  await createBranch(targetBranch)

  console.log('Get all the branch names that have to be merged')
  const branchesForWhichTheMergeHasFailed = []
  const branchNames = await branchesToSynchronize(repository, label)
  for (let branchName of branchNames) {
    try {
      console.log(`\t• merging branch ${branchName}`)
      await merge(branchName)
    } catch (e) {
      console.error(`\t=> could not merge branch ${branchName}`)
      branchesForWhichTheMergeHasFailed.push(branchName)
      await abortMerge()
    }
  }

  if (branchesForWhichTheMergeHasFailed.length > 0) {
    console.log(`List of branches that have fail when merged on ${targetBranch}:`)
    branchesForWhichTheMergeHasFailed.forEach(branch => console.log(`\t• ${branch}`))
    console.log(`They have to be merged manually`)
    return
  }

  if (branchNames.length > 0) {
    console.log(`Pushing ${targetBranch} to origin`)
    await pushForce(targetBranch)
  }

  await checkout(previousBranch)
}

export { synchronizeBranchesAndLabels }
