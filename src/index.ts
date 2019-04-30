import fg from "fast-glob"
import properties from "properties"
import findUp from "find-up"
import * as fs from "fs"
import { promisify } from "util"
import mm from "micromatch"

let readFile = promisify(fs.readFile)

export interface PurposefileOpts {
	cwd?: string
	search?: string[]
	inverse?: boolean
	ignore?: string[]
}

export default async function purposefile(opts: PurposefileOpts = {}) {
	let cwd = opts.cwd || process.cwd()
	let inverse = opts.inverse || false
	let search = opts.search || (opts.inverse ? [] : ["**"])
	let ignore = opts.ignore || []

	let file = await findUp(".purposefile", { cwd })
	if (!file) throw new Error(`.purposefile not found for "${cwd}"`)

	let input = await readFile(file, "utf-8")
	let props = properties.parse(input)
	let patterns = Object.keys(props)

	let filters = inverse
		? []
		: patterns.map(p => {
				return p.startsWith("!") ? p.slice(1) : `!${p}`
		  })

	let ignores = ignore.map(pattern => `!${pattern}`)

	let matches = await fg([...search, ...filters, ...ignores], { cwd })

	let reversedPatterns = patterns.slice().reverse()

	return matches.map(file => {
		let pattern = reversedPatterns.find(pattern =>
			mm.isMatch(file as string, pattern),
		)
		let purpose = pattern ? props[pattern] : null
		return { file: file as string, purpose }
	})
}
