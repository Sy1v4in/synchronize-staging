import { abortMerge, checkout, createBranch, currentBranch, ensureCleanLocalRepo, merge, pushForce } from './git'
import { github as githubProvider } from './github'
import { type Context } from './types'

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

const execute = ({ githubToken, logger }: Context) => {
  const synchronizeBranchesAndLabels: SynchronizeBranchesAndLabels = async ({ repository, sourceBranch, targetBranch, label }) => {
    const github = githubProvider({ githubToken, logger })

    await ensureCleanLocalRepo()
    const previousBranch = await currentBranch()

    logger.info(`Checking out ${sourceBranch} and pulling`)
    await checkout(sourceBranch, { pull: true })
    logger.info(`Creating ${targetBranch} branch`)
    await createBranch(targetBranch)

    logger.info('Get all the branch names that have to be merged')
    const branchesForWhichTheMergeHasFailed = []
    const branchNames = await github.branchesToSynchronize(repository, label)
    for (let branchName of branchNames) {
      try {
        logger.info(`\t• merging branch ${branchName}`)
        await merge(branchName)
      } catch (e) {
        logger.error(`\t=> could not merge branch ${branchName}`)
        branchesForWhichTheMergeHasFailed.push(branchName)
        await abortMerge()
      }
    }

    if (branchesForWhichTheMergeHasFailed.length > 0) {
      logger.warning(`List of branches that have fail when merged on ${targetBranch}:`)
      branchesForWhichTheMergeHasFailed.forEach(branch => console.log(`\t• ${branch}`))
      logger.warning(`They have to be merged manually`)
      return
    }

    if (branchNames.length > 0) {
      logger.info(`Pushing ${targetBranch} to origin`)
      await pushForce(targetBranch)
    }

    await checkout(previousBranch)
  }

  return {
    synchronizeBranchesAndLabels,
  }
}

export { execute }
