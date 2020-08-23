# GIEE Network Manager Tools Node.js


[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE)

GIEE Network Manager Tools Node.js is a Tools for GIEE, Its goal is to manage firewall and so on.

## Installation

### Clone the repository and install dependencies.
```shell
git clone https://github.com/cliffxzx/gieenm-tools-nodejs.git
cd gieenm-tools-nodejs
npm i
```

### Set Environmental variables

touch .env file
```shell
touch .env
```
```
// .env
DB_HOST=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

FIREWALL_PAGE_COUNT=200

SERVER_PORT=80
SERVER_SALT=
```

### Set Database Default Data
```json
// seeder/data/hosts.json
[
  {
    "name": "${name}",
    "url": "${url}",
    "auth": "${auth}" // Like "Basic xxxx"
  }
]
```

### Start
```
npm start
```