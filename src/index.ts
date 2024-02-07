import { abortMerge, checkout, createBranch, merge, pushForce } from './git'
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

    logger.info(`Checking out ${sourceBranch} and pulling`)
    await checkout(sourceBranch, { pull: true })
    logger.info(`Creating ${targetBranch} branch`)
    await createBranch(targetBranch)

    logger.info('Get all the branch names that have to be merged')
    const branchesForWhichTheMergeHasFailed = []
    const branchNames = await github.branchesToSynchronize(repository, label)
    for (let branchName of branchNames) {
      try {
        logger.debug(`\t• merging branch ${branchName}`)
        await merge(branchName)
      } catch (e) {
        logger.debug(`\t=> could not merge branch ${branchName}`, e)
        branchesForWhichTheMergeHasFailed.push(branchName)
        await abortMerge()
      }
    }

    if (branchesForWhichTheMergeHasFailed.length > 0) {
      logger.warn(`List of branches that have fail when merged on ${targetBranch}:`)
      branchesForWhichTheMergeHasFailed.forEach(branch => console.log(`\t• ${branch}`))
      logger.warn(`They have to be merged manually`)
    }

    logger.info(`Pushing ${targetBranch} to origin`)
    await pushForce(targetBranch)
  }

  return {
    synchronizeBranchesAndLabels,
  }
}

export { execute }
