const setOutputSpy = jest.fn() // need to hoist these
const failedSpy = jest.fn()
import * as main from '../src/main'
import {expect, test} from '@jest/globals'
import * as parseSitemap from '../src/parse-sitemap'
import {setupServer} from 'msw/node'
import {rest} from 'msw'

const SITEMAP_URL = 'https://www.example.com/sitemap.xml'
jest.mock('@actions/core', () => ({
  ...jest.requireActual('@actions/core'),
  getInput: jest.fn().mockImplementation(() => SITEMAP_URL),
  setOutput: setOutputSpy,
  setFailed: failedSpy
}))

describe('main', () => {
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
