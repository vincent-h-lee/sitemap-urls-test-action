import * as core from '@actions/core'
import {parseSitemap} from './parse-sitemap'
import {testUrls} from './test-urls'

export async function run(): Promise<void> {
  try {
    const sitemapUrl = core.getInput('sitemap_url', {required: true})

    core.debug(`Fetching sitemap at ${sitemapUrl}`)
    const {sites: urls, errors} = await parseSitemap(sitemapUrl)

    if (errors.length) {
      throw new Error(`SitemapError: ${errors[0].type}`)
    }

    if (!urls.length) {
      throw new Error(`SitemapError: no urls in sitemap`)
    }

    core.debug(`Testing ${urls.length} sites`)
    const {results, failures} = await testUrls(urls)
    results.forEach(({url, success}) => {
      core.debug(`${success ? 'Pass' : 'Fail'} - ${url}`)
    })

    core.setOutput('urls_tested', results.length)
    core.setOutput('urls_passed', results.length - failures.length)
    core.setOutput('urls_failed', failures.length)

    if (failures.length > 0) {
      core.debug(`Failed - ${failures.length} sites`)
      failures.forEach(({url, error}) => {
        core.debug(`${url} ${error.message}`)
      })
      throw new Error('SitemapTestFailed')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
      return
    }
    core.setFailed(JSON.stringify(error))
  }
}

run()
