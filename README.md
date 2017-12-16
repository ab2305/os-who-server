# os-who-server

## Introduction

누굴까 api 서버이다.

## Tech Stack

* environment: Node.js v8
* package manager: Yarn
* unit testing frameworks: none
* version control system: Git
* editors: whatever you want

더 자세한 내용은 `package.json` 파일 참고.

## Supported Browsers

[[추가바람]]

## Configurations

`config` 디렉토리 내에 환경에 맞는 설정파일을 생성해야 한다.
기본적으로 `default.json`이 있으며,
`NODE_ENV` 환경변수에 따라 `development.json`, `production.json` 파일을 추가로 오버라이딩하게 된다.

정확한 로직은 [node-config](https://github.com/lorenwest/node-config) 문서 참고

## Commands

```
$ node .
```

`express` 서버를 띄우며, 역할은 다음과 같다.

* api 제공
* html, css, js 등의 static assets을 serve
