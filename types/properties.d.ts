declare module "properties" {
	interface Properties {
		[key: string]: string
	}

	export function parse(data: string): Properties
}
