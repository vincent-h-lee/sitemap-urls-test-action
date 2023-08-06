import Sitemapper, {SitemapperResponse} from 'sitemapper'

export const parseSitemap = async (
  url: string
): Promise<SitemapperResponse> => {
  const sitemapper = new Sitemapper({
    url
  })
  return sitemapper.fetch()
}
