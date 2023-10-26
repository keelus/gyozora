export function Plural(amount : number, word : string) : string {
	return amount === 1 ? word : word+"s"
}