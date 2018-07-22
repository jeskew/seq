# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.4.2"></a>
## [0.4.2](https://github.com/jeskew/seq/compare/v0.4.1...v0.4.2) (2018-07-22)


### Bug Fixes

* ensure compatibility with native Node ESM system ([#8](https://github.com/jeskew/seq/issues/8)) ([41a52e5](https://github.com/jeskew/seq/commit/41a52e5))
* export helper functions to match documentation ([#9](https://github.com/jeskew/seq/issues/9)) ([987b95c](https://github.com/jeskew/seq/commit/987b95c))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/jeskew/seq/compare/v0.4.0...v0.4.1) (2018-03-18)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/jeskew/seq/compare/v0.3.0...v0.4.0) (2018-03-18)


### Bug Fixes

* ensure calling return on a merge iterator calls return on outstanding underlying iterators ([485d1f4](https://github.com/jeskew/seq/commit/485d1f4))
* ensure return is called when collect throws an error ([3175b35](https://github.com/jeskew/seq/commit/3175b35))


### Features

* Add ES Module output to NPM artifacts ([6c3bfa1](https://github.com/jeskew/seq/commit/6c3bfa1))


### Performance Improvements

* ensure distinct uses synchronous iteration on sync iterators ([041f222](https://github.com/jeskew/seq/commit/041f222))
* ensure every uses synchronous iteration on sync iterators ([e43ee1d](https://github.com/jeskew/seq/commit/e43ee1d))
* ensure filter uses synchronous iteration on sync iterators ([8fe6a50](https://github.com/jeskew/seq/commit/8fe6a50))
* ensure find uses synchronous iteration on sync iterators ([5a0378a](https://github.com/jeskew/seq/commit/5a0378a))
* ensure includes uses synchronous iteration on sync iterators ([096583f](https://github.com/jeskew/seq/commit/096583f))
* ensure interleave lazily initializes underlying iterators ([ac075b9](https://github.com/jeskew/seq/commit/ac075b9))
* ensure map uses synchronous iteration on sync iterators ([0f2079f](https://github.com/jeskew/seq/commit/0f2079f))
* ensure skip uses synchronous iteration for sync iterables ([417bb51](https://github.com/jeskew/seq/commit/417bb51))
* ensure sum uses synchronous iteration on sync iterators ([2a5c9f8](https://github.com/jeskew/seq/commit/2a5c9f8))
* ensure take uses synchronous iteration on sync iterators ([2bd1a18](https://github.com/jeskew/seq/commit/2bd1a18))
* ensure takeWhile uses synchronous iteration on sync iterators ([4358ead](https://github.com/jeskew/seq/commit/4358ead))
* ensure zip uses synchronous iteration on sync iterators ([4cb2d21](https://github.com/jeskew/seq/commit/4cb2d21))
* use await instead of tslib for reduce ([a0101bc](https://github.com/jeskew/seq/commit/a0101bc))
* use await instead of tslib for skipWhile ([d0c4d34](https://github.com/jeskew/seq/commit/d0c4d34))
* use await instead of tslib for some ([c13fa1b](https://github.com/jeskew/seq/commit/c13fa1b))
* use await instead of tslib in tap ([b9b7a67](https://github.com/jeskew/seq/commit/b9b7a67))
* Use iterator stack rather than recursion in flatten ([1fe36fe](https://github.com/jeskew/seq/commit/1fe36fe))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/jeskew/async-seq/compare/v0.2.0...v0.3.0) (2017-12-15)


### Features

* **map:** Do not automatically wait on the result of a mapping function ([fe07d76](https://github.com/jeskew/async-seq/commit/fe07d76))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/jeskew/async-seq/compare/v0.1.2...v0.2.0) (2017-12-04)


### Features

* Add flatten and flatmap ([0552916](https://github.com/jeskew/async-seq/commit/0552916))
* Add skipWhile ([54de415](https://github.com/jeskew/async-seq/commit/54de415))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/jeskew/es-seq/compare/v0.1.1...v0.1.2) (2017-12-01)


### Bug Fixes

* **range:** Ensure bound is properly applied when end is less than start ([c4e13f4](https://github.com/jeskew/es-seq/commit/c4e13f4))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/jeskew/es-seq/compare/v0.1.0...v0.1.1) (2017-11-29)


### Bug Fixes

* **misc:** Standardize handling of values bundled with a done message ([185e79d](https://github.com/jeskew/es-seq/commit/185e79d))
