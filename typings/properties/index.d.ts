declare module "properties" {
	interface Properties {
		[key: string]: string
	}

	interface ParseOpts {
		comments?: string | string[]
		strict?: boolean
	}

	export function parse(data: string, opts?: ParseOpts): Properties
}
