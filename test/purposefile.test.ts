import test from "ava"
import fixturez from "fixturez"
import * as fs from "fs"
import path from "path"
import purposefile from "../src/index"
import stripIndent from "strip-indent"

let f = fixturez(__dirname)

function temp(filenames: string[], purposefile?: string) {
	let dir = f.temp()

	if (typeof purposefile === "string") {
		fs.writeFileSync(path.join(dir, ".purposefile"), stripIndent(purposefile))
	}

	for (let filename of filenames) {
		fs.writeFileSync(path.join(dir, filename), "")
	}

	return dir
}

test("all declared files", async t => {
	let cwd = temp(
		["foo", "bar"],
		`
			.purposefile Purposefile
			foo Foo
			bar Bar
		`,
	)
	let res = await purposefile({ cwd })
	t.deepEqual(res, [])
})

test("undeclared file", async t => {
	let cwd = temp(
		["foo", "bar"],
		`
			.purposefile Purposefile
			foo Foo
		`,
	)
	let res = await purposefile({ cwd })
	t.deepEqual(res, [{ file: "bar", purpose: null }])
})

test("no purposefile", async t => {
	let cwd = temp(["foo", "bar"])
	await t.throwsAsync(purposefile({ cwd }), /\.purposefile not found for ".*"/)
})

test("{ search }", async t => {
	let cwd = temp(
		["foo", "bar", "baz"],
		`
			.purposefile Purposefile
			foo Foo
		`,
	)
	let res = await purposefile({ cwd, search: ["bar"] })
	t.deepEqual(res, [{ file: "bar", purpose: null }])
})

test("{ search, includeKnown: true }", async t => {
	let cwd = temp(
		["foo", "bar", "baz"],
		`
			.purposefile Purposefile
			foo Foo
			bar Bar
		`,
	)
	let res = await purposefile({
		cwd,
		search: ["bar", "baz"],
		includeKnown: true,
	})
	t.deepEqual(res, [
		{ file: "bar", purpose: "Bar" },
		{ file: "baz", purpose: null },
	])
})

test("{ search, ignore }", async t => {
	let cwd = temp(
		["foo", "bar", "baz"],
		`
			.purposefile Purposefile
			foo Foo
		`,
	)
	let res = await purposefile({ cwd, search: ["*"], ignore: ["baz"] })
	t.deepEqual(res, [{ file: "bar", purpose: null }])
})

test("{ search, ignore, includeKnown: true }", async t => {
	let cwd = temp(
		["foo", "bar", "baz"],
		`
			.purposefile Purposefile
			foo Foo
		`,
	)
	let res = await purposefile({
		cwd,
		search: ["*"],
		ignore: ["baz"],
		includeKnown: true,
	})
	t.deepEqual(res, [
		{ file: ".purposefile", purpose: "Purposefile" },
		{ file: "bar", purpose: null },
		{ file: "foo", purpose: "Foo" },
	])
})

test("negated file", async t => {
	let cwd = temp(
		["foo", "bar", "baz"],
		`
			.purposefile Purposefile
			* Files
			# No Bar
			bar
		`,
	)
	let res = await purposefile({ cwd })
	t.deepEqual(res, [{ file: "bar", purpose: null }])
})

test("negated part", async t => {
	let cwd = temp(
		["file.js", "file.test.js"],
		`
			.purposefile Purposefile
			*.js Source files
			# Not test files
			*.test.js
		`,
	)
	let res = await purposefile({ cwd })
	t.deepEqual(res, [{ file: "file.test.js", purpose: null }])
})
