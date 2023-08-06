import pLimit from 'p-limit'
import superagent from 'superagent'

const CONCURRENT_REQUESTS = 5
const limit = pLimit(CONCURRENT_REQUESTS)

type Success = {url: string; success: true}
type Failure = {url: string; success: false; error: Error}

const isFailure = (res: Success | Failure): res is Failure => {
  return !res.success
}

export const testUrls = async (
  urls: string[]
): Promise<{results: (Success | Failure)[]; failures: Failure[]}> => {
  const results = await Promise.all(
    urls.map(async url =>
      limit(async () =>
        superagent
          .get(url)
          .then(res => {
            const success = res.statusCode >= 200 && res.statusCode < 400
            if (success) {
              return {
                url,
                success
              }
            }
            return {
              url,
              success: false,
              error: new Error(`HttpRequestFailed: ${res.statusCode}`)
            }
          })
          .catch(e => ({url, success: false, error: e}))
      )
    )
  )

  return {
    results,
    failures: results.filter(isFailure)
  }
}
