"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const parse_sitemap_1 = require("./parse-sitemap");
const test_urls_1 = require("./test-urls");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sitemapUrl = core.getInput('sitemap_url', { required: true });
            core.debug(`Fetching sitemap at ${sitemapUrl}`);
            const { sites: urls, errors } = yield (0, parse_sitemap_1.parseSitemap)(sitemapUrl);
            if (errors.length) {
                throw new Error(`SitemapError: ${errors[0].type}`);
            }
            if (!urls.length) {
                throw new Error(`SitemapError: no urls in sitemap`);
            }
            core.debug(`Testing ${urls.length} sites`);
            const { results, failures } = yield (0, test_urls_1.testUrls)(urls);
            results.forEach(({ url, success }) => {
                core.debug(`${success ? 'Pass' : 'Fail'} - ${url}`);
            });
            core.setOutput('urls_tested', results.length);
            core.setOutput('urls_passed', results.length - failures.length);
            core.setOutput('urls_failed', failures.length);
            if (failures.length > 0) {
                core.debug(`Failed - ${failures.length} sites`);
                failures.forEach(({ url, error }) => {
                    core.debug(`${url} ${error.message}`);
                });
                throw new Error('SitemapTestFailed');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
                return;
            }
            core.setFailed(JSON.stringify(error));
        }
    });
}
exports.run = run;
run();
