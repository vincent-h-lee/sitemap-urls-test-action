import * as core from '@actions/core'
import * as main from '../src/index'
import {expect, test} from '@jest/globals'
import * as parseSitemap from '../src/parse-sitemap'
import {setupServer} from 'msw/node'
import {rest} from 'msw'

describe('main', () => {
  const sitemapUrl = 'https://www.example.com/sitemap.xml'
  jest.spyOn(core, 'getInput').mockImplementation(() => sitemapUrl)
  const setOutputSpy = jest.spyOn(core, 'setOutput')
  const failedSpy = jest.spyOn(core, 'setFailed')
  const server = setupServer()

  beforeAll(() => server.listen())

  afterEach(() => {
    jest.clearAllMocks()
    server.resetHandlers()
  })

  afterAll(() => server.close())

  test('passes teh action and sets output when sitemap urls all pass', async () => {
    jest.spyOn(parseSitemap, 'parseSitemap').mockResolvedValue({
      url: '',
      errors: [],
      sites: ['https://example.com/a', 'https://example.com/b']
    })
    server.use(
      rest.get('https://example.com/*', (_req, res, ctx) => {
        return res(ctx.status(200))
      })
    )

    await main.run()

    expect(failedSpy).toBeCalledTimes(0)
    expect(setOutputSpy).toBeCalledWith('urls_tested', 2)
    expect(setOutputSpy).toBeCalledWith('urls_passed', 2)
    expect(setOutputSpy).toBeCalledWith('urls_failed', 0)
  })

  test('fails the action when no urls returned from sitemap', async () => {
    jest.spyOn(parseSitemap, 'parseSitemap').mockResolvedValue({
      url: '',
      errors: [],
      sites: []
    })

    await main.run()
    expect(failedSpy).toBeCalledTimes(1)
    expect(failedSpy).toBeCalledWith('SitemapError: no urls in sitemap')
  })

  test('fails the action and sets output when a single url 400s', async () => {
    jest.spyOn(parseSitemap, 'parseSitemap').mockResolvedValue({
      url: '',
      errors: [],
      sites: ['https://example.com/a', 'https://example.com/b']
    })

    server.use(
      rest.get('https://example.com/a', (_req, res, ctx) => {
        return res(ctx.status(200))
      }),
      rest.get('https://example.com/b', (_req, res, ctx) => {
        return res(ctx.status(400))
      })
    )

    await main.run()
    expect(failedSpy).toBeCalledTimes(1)
    expect(failedSpy).toBeCalledWith('SitemapTestFailed')
  })
})
