# purposefile

> Make sure every file in your repo is exactly where it should be.

## Install

```sh
npm install --save-dev purposefile
```

## Usage

First create a `.purposefile` in the root of your project like this:

```properties
.purposefile                 Configures purposefile
.gitignore                   Configures git to ignore certain files
.prettierrc                  Configures Prettier
package.json                 Configures npm and related tools
package-lock.json            Lock file for npm dependencies
tsconfig.json                Configures TypeScript
README.md                    Documentation for repo
LICENSE                      License for package
node_modules/**              Dependencies installed by npm
src/**/*.ts                  Source files
!src/**/*.test.ts            Don't place test files within src/
test/**/*.test.ts            Test files
dist/**/*.{js,d.ts}{,.map}   Built source files
```

Then run:

```sh
npx purposefile
```

If all the files in the repo are known, you'll get:

```
Every file in this repo has a known purpose
```

Or if there's any unknown files:

```
The following files have no known purpose:

random-file-1
path/to/random-file-2

You either need to delete these files or update the .purposefile
```

If you want to check the purpose of a file you can run:

```sh

```
