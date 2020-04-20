# Calamus Blog API

[![Build Status](https://travis-ci.org/Wyvarn/calamus.svg?branch=develop)](https://travis-ci.org/Wyvarn/calamus)
![Docker Image CI](https://github.com/Wyvarn/calamus/workflows/Docker%20Image%20CI/badge.svg)
![NodeJS Package](https://github.com/Wyvarn/calamus/workflows/NodeJS%20Package/badge.svg)
![NPM Version Bump](https://github.com/Wyvarn/calamus/workflows/NPM%20Version%20Bump/badge.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/1d6f5b05347644d9acbe7ff73bf9f858)](https://www.codacy.com/gh/Wyvarn/calamus?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Wyvarn/calamus&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/Wyvarn/calamus/branch/develop/graph/badge.svg)](https://codecov.io/gh/Wyvarn/calamus)

Calamus(Latin for literature) is a simple blog API written in Express and TypeScript. The datastore prefered is [MongoDB](https://www.mongodb.com/). TypeScript has been picked for its type safety and its interoperability with JavaScript.

## Prerequisites

A couple of things you need to have on your local development environment include:

### Docker & docker-compose

You need to ensure you have [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) installed on your local development environment, as they are used when running containers. More explanation on containers can be found in the links provided for Docker and docker-compose

### Node & NPM(or Yarn)

You require a working version of [NodeJS](https://nodejs.org/) as this is a Node based application and [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) for package management. Yarn has been preferred for this application, but npm can be used as well

## Getting started

Getting started is quite straighforward and the following steps should get you up and running. 

``` bash
$ git clone https://github.com/Wyvarn/calamus.git
$ cd calamus
$ yarn install
# if using npm
$ npm install
```

> This will install the required dependencies

## Running the application

To run the application, first make a copy of the [.env.example](./env.example) file:

```bash
cp .env.example .env
```

Make a copy of [keys/private.pem.example](./keys/private.pem.example) file to keys/private.pem.
Make a copy of [keys/public.pem.example](./keys/private.pem.example) file to keys/public.pem.

More instructions about these keys can be found [here](./keys/instruction.md)

Now, run MongoDB instance with `docker-compose`

```bash
docker-compose up
```

This will pull the MongoDB image from Docker hub if not locally available. If you do not want to use Docker to run MongoDB, you can install MongoDB locally and create users in MongoDB and seed the data taking reference from the mongodb/init-mongo.js
Change the DB_HOST to `localhost` in `.env`.

The application can now be run with:

``` bash
yarn start
# or
npm run start
```

This will run the application in the default port of 3000, however, this can be changed in the `.env` file you created.

## Running tests

You can run tests with `yarn test` or `npm run test` in the root of the project.

## Linting and Code style

Linting and code style configurations can be found in the [tslint](./tslint.json) file provided. Run linting with `yarn tslint` or `npm tslint`.

All available runnable scripts can be found in the [package.json](./package.json) file.

## Deployment and Automation

To deploy the application and automate its pipeline, there are a couple of things you will need to have done first. These will outline the tools currently used. However, you can change them to match your needs.

### Travis CI Account

[TravisCI](https://travis-ci.org/) is a Continous Integration and Deployment Automation Tool and has been picked and used for deployment to [Heroku](https://www.heroku.com/) (A cloud hosting platform). This will run tests, build the application and deploy to Heroku, only on the master branch though. The configuration file can be found [here](./.travis.yml).

You will need to setup an account with Travis for this to work. Also, ensure you have [travis CLI](https://github.com/travis-ci/travis.rb) installed, as its usage will be explained down below.

### Heroku Account

The application has been deployed to [Heroku](https://www.heroku.com/) and if you plan on doing the same, you will need a Heroku account for this to work. If you are not going to use Heroku, then this can be skipped. If you are, then install [heroku cli](https://devcenter.heroku.com/articles/heroku-cli).

Once you have an account, create an application on Heroku. Then change the [.travis.yml](./.travis.yml) file as below:

``` yml
deploy:
  provider: heroku
  app: <APP_NAME>
  on:
    branch: master
  api_key:
    secure: <SECURE_API_KEY_FOR_DEPLOYMENT>
```

> In the <APP_NAME> section, change the name to the application you created on Heroku. The <SECURE_API_KEY_FOR_DEPLOYMENT> is set below.

Now you can use both the Travis CLI and Heroku CLI to configure a secured API key for automated deployments to Heroku with the following command:

```bash
travis encrypt $(heroku auth:token) --add deploy.api_key
```

> More details and documentation can be found [here](https://docs.travis-ci.com/user/deployment/heroku/)

### DockerHub Account

As you may have noticed, there is a [Dockerfile](./Dockerfile) and this contains instructions on how to package the application to run in a Docker container. If you do not plan on having this in a Docker container, that is alright, you can skip this step. However, if you do plan on having this in a Docker container, then you can proceed with first creating an account on [Docker Hub](https://hub.docker.com/). This will be used to host the application images.

The deployment to Docker hub has been automated using [Github Actions](https://github.com/features/actions). All the workflows can be found [here](./.github/workflows). For Docker specifically, the workflow is [here](./.github/workflows/dockerimage.yml).

Once you have your Docker Hub account setup. Edit the file as below

``` yml
name: Docker Image CI

on:
  push:
    branches: [ master, beta, develop ]

jobs:

  push_to_registries:
    name: Pushes Docker image to Dockerhub and Github Registry
    runs-on: ubuntu-latest

    steps:
    - name: Checkout out repo
      uses: actions/checkout@v2

    - name: Push to Docker Hub
      uses: docker/build-push-action@v1
      with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          repository: <YOUR_DOCKER_HUB_USERNAME>/<YOUR_PREFERRED_IMAGE_NAME>
          tag_with_ref: true

    - name: Push to GitHub Packages
      uses: docker/build-push-action@v1
      with:
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        registry: docker.pkg.github.com
        repository: <GITHUB_USERNAME_OR_ORGANIZATION>/<REPOSITORY>/<YOUR_PREFERRED_IMAGE_NAME>
        tag_with_ref: true
```

> You can edit the file format to suit your needs, maybe even push it to a custom docker registry.

The fields to edit are in `<>` and you can edit them based on your needs and preference. As you can see, this pushes images to both Docker Hub and [Github Packages](https://github.com/features/packages). You can change this as needed. Also, notice the fields below:

``` yml
# ... Other yaml config
      with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
# ...
```

The `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets have to be set in the repository as documented [here](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)

Again, if you do not prefer using Docker hub as your registry, you can always remove the fields that push it to Docker hub and use Github Packages instead, or your own custom solution.

### NPM Registry Publication

As this is a node application, it has also been configured to be published in an NPM registry. The one used here is Github Packages, but, this can be changed to use an NPM registry of your choice.

The configurations to deploy to Github NPM Package registry are found in [this file](./.github/workflows/npmpublish.yml) as below:

```yml
name: Node.js Package

on:
  push:
    branches: [master, beta, develop]

jobs:
  publish-gpr:
    name: Publish to Github NPM Registry
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: 13
          registry-url: https://npm.pkg.github.com/
      - run: npm install
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

> This can be edited as need be to publish to another registry, if you do not want to publish to Github NPM Package registry

NB: the secrets.GITHUB_TOKEN field is always available and scoped to the repository owner.

### Release(Tags) automation

For Github release automation, [semantic-release](https://github.com/semantic-release/semantic-release) has been picked, but any other solution can be picked as well. The configuratons can be found [here](.releaserc.json). The automated releases have been setup to only run on master and beta branches(if you have a beta branch that is). The tool is automated with Travis.

### API Documentation

API documentation has been setup using [Apiary](https://apiary.io/) and the documentation can be found [here](https://calamusapi.docs.apiary.io/) and editing can be done [here](./apiary.apib). If you intend to use the same method to document the API, Then you will need to have an account with Apiary. If not, then this is not required.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags](https://github.com/Wyvarn/calamus/releases) in this repository.

## Built With

+ [TypeScript](https://www.typescriptlang.org/)
+ [Express](https://expressjs.com/)
+ [Mongoose](https://mongoosejs.com/)
+ [Jest](https://jestjs.io/)

## Authors

+ [Brian Lusina](https://github.com/BrianLusina) - Initial Work

### License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://forthebadge.com)
