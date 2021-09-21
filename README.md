Framework Evaluation
====================

This project is to be used to evaluate different javascript-frameworks for development of single-page-applications.

ATM we plan to use the following candidates:

* [emberjs](http://emberjs.com/)
* [angular 2](https://angular.io/)
* [meteor](https://www.meteor.com/)

The backend is based on [express](http://expressjs.com/de/), using [LokiJS](http://lokijs.org/#/) as
ORM with an JSON-datastore providing three models:

* group
* agent
* indicator

200 instances of group with 30 indicators and 50 agents per group via RESTful endpoints to get
all instances at once as well as create, read, update and destroy instances of group and agent. The main-view as a list of all groups with their indicators is to be implemented using
[handsontable](https://handsontable.com/).

After implementing the backend, the app is developed using the candidate in a separate branch.

Installing
----------

Clone the repository:

```bash
git clone git@github.com:railsc0d0r/framework_evaluation.git
```

and install the dependencies:

```bash
npm install
```

Development
-----------
Seed the datastore:

```bash
npm run seed
```

Start the server on port 3000:

```bash
npm start
```
The port can be changed by setting an env-variable like so:

```bash
PORT=4000 npm start
```

Generate the docs for the backend:

```bash
npm run generate_docs
```

The generated HTML-docs can be found in docs/.

Testing
-------

Run the backend-tests with:

```bash
npm test
```
