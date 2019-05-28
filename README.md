# purposefile

> Make sure every file in your repo is exactly where it should be.

![Example of running purposefile CLI](./.github/list.png)

## Install

First, [make sure node and npm are installed](https://nodejs.org/).

Then if you have an existing `package.json` you can run:

```sh
npm install --save-dev purposefile
npx purposefile
```

Or if you want to use it globally you can also just run:

```sh
npx purposefile
```

It's recommended that you save this to your [`package.json#scripts`](https://docs.npmjs.com/misc/scripts)

```json
{
	"name": "my-package",
	"scripts": {
		"check-files": "purposefile"
	}
}
```

```sh
npm run check-files
```

## Usage

First create a `.purposefile` in the root of your project like this:

```properties
.purposefile                 Configures purposefile
.gitignore                   Configures git to ignore certain files
.prettierrc                  Configures Prettier
.prettierignore              Configures Prettier ignored files
package.json                 Configures npm and related tools
package-lock.json            Lock file for npm dependencies
tsconfig.json                Configures TypeScript
README.md                    Documentation for repo
LICENSE                      License for package
.git/**                      Internal git state & config
node_modules/**/*            Dependencies installed by npm
typings/*/*.d.ts             TypeScript library type definitions
src/**/*.ts                  Source files
!src/**/*.test.ts            Dont place test files within src/
test/**/*.test.ts            Test files
dist/**/*.{js,d.ts}{,.map}   Built source files
.github/*.png                Images for README
```

> **Note:** Entries are matched in reverse order. Entries with no defined
> purpose or that start with a `!` act like negations to the globs above them.

Then run:

```sh
npx purposefile
```

If all the files in the repo are known, you'll get:

![Example output of purposefile when all files are known](./.github/no-bad-files.png)

Or if there's any unknown files:

![Example output of purposefile when there are unknown files](./.github/bad-files.png)

If you want to check the purpose of a file you can run:

```sh
purposefile path/to/file
```

![Example output of purposefile for a single file lookup](./.github/lookup.png)

If you want to check the purpose of many files at once you can also specify globs:

```sh
purposefile '**' --ignore '**/node_modules/**'
```

![Example output of purposefile for a glob](./.github/list.png)

> **Note:** You can specify multiple `--ignore` patterns to exclude files from being listed.

If you want to check `purposefile` before every commit, you can do so with [Husky](https://github.com/typicode/husky):

```jsonc
{
	"husky": {
		"hooks": {
			"pre-commit": "purposefile" // Or "purposefile && lint-staged" if you use `lint-staged`
		}
	}
}
```
