export namespace models {
	
	export class LeftBarElement {
	    name: string;
	    type: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new LeftBarElement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.path = source["path"];
	    }
	}
	export class SysFile {
	    name: string;
	    extension: string;
	    filename: string;
	    permissions: string;
	    path: string;
	    pathfull: string;
	    size: number;
	    iconClass: string;
	    isFolder: boolean;
	    isHidden: boolean;
	    modifiedAt: number;
	    preview: string;
	    selected: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SysFile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.extension = source["extension"];
	        this.filename = source["filename"];
	        this.permissions = source["permissions"];
	        this.path = source["path"];
	        this.pathfull = source["pathfull"];
	        this.size = source["size"];
	        this.iconClass = source["iconClass"];
	        this.isFolder = source["isFolder"];
	        this.isHidden = source["isHidden"];
	        this.modifiedAt = source["modifiedAt"];
	        this.preview = source["preview"];
	        this.selected = source["selected"];
	    }
	}

}

