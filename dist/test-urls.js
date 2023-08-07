"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUrls = void 0;
const p_limit_1 = __importDefault(require("p-limit"));
const superagent_1 = __importDefault(require("superagent"));
const CONCURRENT_REQUESTS = 5;
const limit = (0, p_limit_1.default)(CONCURRENT_REQUESTS);
const isFailure = (res) => {
    return !res.success;
};
const testUrls = (urls) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield Promise.all(urls.map((url) => __awaiter(void 0, void 0, void 0, function* () {
        return limit(() => __awaiter(void 0, void 0, void 0, function* () {
            return superagent_1.default
                .get(url)
                .then(res => {
                const success = res.statusCode >= 200 && res.statusCode < 400;
                if (success) {
                    return {
                        url,
                        success
                    };
                }
                return {
                    url,
                    success: false,
                    error: new Error(`HttpRequestFailed: ${res.statusCode}`)
                };
            })
                .catch(e => ({ url, success: false, error: e }));
        }));
    })));
    return {
        results,
        failures: results.filter(isFailure)
    };
});
exports.testUrls = testUrls;
