![build and test workflow](https://github.com/github/docs/actions/workflows/test.yml/badge.svg)

# Sitemap Urls Test Action

Test that each URL in your sitemap exists and loads with a success code.

## Use Case

- Test sitemap URLs as a CI step
- Sanity check for production site's URLs on deploy or on a schedule

## Usage

```
- uses: vincent-h-lee/sitemap-urls-test-action@latest
    with:
      sitemap_url: https://leevincenth.com/sitemap.xml # or http://localhost:3000/sitemap.xml
```

## Contributing

Install the dependencies

```bash
$ npm install
```

Build the typescript and package it for distribution

```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:

```bash
$ npm run test
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
