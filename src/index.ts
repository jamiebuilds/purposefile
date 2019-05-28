import fg from "fast-glob"
import properties from "properties"
import findUp from "find-up"
import * as fs from "fs"
import { promisify } from "util"
import mm from "micromatch"
import path from "path"

let readFile = promisify(fs.readFile)
let micromatchOpts = { dot: true }

export interface PurposefileOpts {
	cwd?: string
	search?: string[]
	includeKnown?: boolean
	ignore?: string[]
}

export interface ValidEntry {
	pattern: string
	purpose: string
}

export interface NegatedEntry {
	pattern: string
	purpose: null
	negated: string | true
}

export interface ValidMatch extends ValidEntry {
	file: string
}

export interface NegatedMatch extends NegatedEntry {
	file: string
}

export interface NotMatch {
	file: string
	pattern: null
	purpose: null
	negated: false
}

export type Entry = ValidEntry | NegatedEntry
export type Match = ValidMatch | NegatedMatch | NotMatch
export type Entries = Entry[]
export type Matches = Match[]

function toEntry(pattern: string, value: string | null): Entry {
	if (pattern.startsWith("!") || !value) {
		return { pattern, purpose: null, negated: value || (true as true) }
	} else {
		return { pattern, purpose: value }
	}
}

function toMatch(file: string, entry: Entry | null): Match {
	if (entry) {
		return { file, ...entry }
	} else {
		return { file, pattern: null, purpose: null, negated: false }
	}
}

export function find(cwd: string): Promise<string | null> {
	return findUp(".purposefile", { cwd })
}

export function parse(str: string): Entries {
	let props = properties.parse(str, {
		comments: [";", "#"],
		strict: true,
	})

	return Object.keys(props)
		.map(pattern => toEntry(pattern, props[pattern]))
		.reverse()
}

export function match(file: string, entries: Entries) {
	let found = entries.find(entry =>
		mm.isMatch(file, entry.pattern.replace(/^\!/, ""), micromatchOpts),
	)
	return toMatch(file, found || null)
}

export default async function purposefile(opts: PurposefileOpts = {}) {
	let cwd = opts.cwd || process.cwd()
	let search = opts.search || ["**"]
	let includeKnown = opts.includeKnown || false
	let ignore = opts.ignore || []

	let file = await find(cwd)
	if (!file) throw new Error(`.purposefile not found for "${cwd}"`)

	let root = path.dirname(file)

	let input = await readFile(file, "utf-8")
	let entries = parse(input)

	let ignores = ignore.map(pattern => `!${pattern}`)

	let globs = [...search, ...ignores]
	let files: string[] = await fg(globs, { cwd: root, ...micromatchOpts })

	files = files.slice().sort((a, b) => a.localeCompare(b))

	let results = []

	for (let file of files) {
		let result = match(file, entries)
		if (!result.purpose || includeKnown) {
			results.push(result)
		}
	}

	return results
}
