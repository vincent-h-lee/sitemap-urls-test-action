import Sitemapper from 'sitemapper'

export const parseSitemap = (url: string) => {
  const sitemapper = new Sitemapper({
    url
  })
  return sitemapper.fetch()
}
