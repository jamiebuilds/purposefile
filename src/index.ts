import fg from "fast-glob"
import properties from "properties"
import findUp from "find-up"
import * as fs from "fs"
import { promisify } from "util"
import mm from "micromatch"
import path from "path"

let readFile = promisify(fs.readFile)

export interface PurposefileOpts {
	cwd?: string
	search?: string[]
	includeKnown?: boolean
	ignore?: string[]
}

let micromatchOpts = { dot: true }

export default async function purposefile(opts: PurposefileOpts = {}) {
	let cwd = opts.cwd || process.cwd()
	let search = opts.search || ["**"]
	let includeKnown = opts.includeKnown || false
	let ignore = opts.ignore || []

	let file = await findUp(".purposefile", { cwd })
	if (!file) throw new Error(`.purposefile not found for "${cwd}"`)

	let root = path.dirname(file)

	let input = await readFile(file, "utf-8")
	let props = properties.parse(input, {
		comments: [";", "#"],
		strict: true,
	})

	let ignores = ignore.map(pattern => `!${pattern}`)

	let globs = [...search, ...ignores]
	let files: string[] = await fg(globs, { cwd: root, ...micromatchOpts })

	files = files.slice().sort((a, b) => a.localeCompare(b))

	let patterns = Object.keys(props).reverse()
	let entries = []

	for (let file of files) {
		let match = patterns.find(pattern =>
			mm.isMatch(file, pattern, micromatchOpts),
		)
		let purpose = match ? props[match] : null

		if (!purpose || includeKnown) {
			entries.push({ file, purpose })
		}
	}

	return entries
}
