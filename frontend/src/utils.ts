export function Plural(amount : number, word : string) : string {
	return amount === 1 ? word : word+"s"
}

export function renderBytes(bytes : number) : string {
	if(bytes <= 1_000) return bytes + " B";
	if(bytes <= 1_000_000) return (bytes/1_000).toFixed(2) + " KB";
	if(bytes <= 1_000_000_000) return (bytes/1_000_000).toFixed(2) + " MB";
	if(bytes <= 1_000_000_000_000) return (bytes/1_000_000_000).toFixed(2) + " GB";
	if(bytes <= 1_000_000_000_000_000) return (bytes/1_000_000_000_000).toFixed(2) + " TB";
	return bytes.toString()
}