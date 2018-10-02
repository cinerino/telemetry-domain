# Cinerino Telemetry Domain Library for Node.js

[![npm (scoped)](https://img.shields.io/npm/v/@cinerino/telemetry-domain.svg)](https://www.npmjs.com/package/@cinerino/telemetry-domain)
[![CircleCI](https://circleci.com/gh/cinerino/telemetry-domain.svg?style=svg)](https://circleci.com/gh/cinerino/telemetry-domain)
[![Coverage Status](https://coveralls.io/repos/github/cinerino/telemetry-domain/badge.svg?branch=master)](https://coveralls.io/github/cinerino/telemetry-domain?branch=master)
[![Dependency Status](https://img.shields.io/david/cinerino/telemetry-domain.svg)](https://david-dm.org/cinerino/telemetry-domain)
[![Known Vulnerabilities](https://snyk.io/test/github/cinerino/telemetry-domain/badge.svg)](https://snyk.io/test/github/cinerino/telemetry-domain)
[![npm](https://img.shields.io/npm/dm/@cinerino/telemetry-domain.svg)](https://nodei.co/npm/@cinerino/telemetry-domain/)

Cinerino TelemetryのバックエンドサービスをNode.jsで簡単に使用するためのパッケージを提供します。

## Table of contents

* [Usage](#usage)
* [Code Samples](#code-samples)
* [License](#license)

## Usage

```shell
npm install @cinerino/telemetry-domain
```

### Environment variables

| Name                                 | Required | Value                       | Purpose                |
|--------------------------------------|----------|-----------------------------|------------------------|
| `DEBUG`                              | false    | cinerino-telemetry-domain:* | Debug                  |
| `NODE_ENV`                           | true     |                             | environment name       |
| `MONGOLAB_URI`                       | true     |                             | MongoDB connection URI |
| `DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN` | true     |                             | 開発者通知用LINEアクセストークン     |

## Code Samples

Code sample are [here](https://github.com/cinerino/telemetry-domain/tree/master/example).

## License

ISC
