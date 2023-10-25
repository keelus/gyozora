package models

type LeftBarElement struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Path string `json:"path"`
}

type SysFile struct {
	Name             string    `json:"name"`
	Extension        string    `json:"extension"`
	Filename         string    `json:"filename"`
	Permissions      string    `json:"permissions"`
	Path             string    `json:"path"`
	PathFull         string    `json:"pathfull"`
	PathRelative     string    `json:"pathrelative"`
	PathRelativeFull string    `json:"pathrelativefull"`
	Size             int       `json:"size"`
	IconClass        string    `json:"iconClass"`
	IsFolder         bool      `json:"isFolder"`
	IsHidden         bool      `json:"isHidden"`
	ModifiedAt       int       `json:"modifiedAt"`
	Preview          string    `json:"preview"`
	Selected         bool      `json:"selected"`
	ChildrenFiles    []SysFile `json:"childrenFiles"`
	ChildrenFolders  []SysFile `json:"childrenFolders"`
}

type ActionResponse struct {
	File  SysFile     `json:"file"`
	Error SimpleError `json:"error"`
}

type SimpleError struct {
	Status bool   `json:"status"`
	Reason string `json:"reason"`
}

type ReadPathResponse struct {
	DirFiles    []SysFile   `json:"dirFiles"`
	DirFolders  []SysFile   `json:"dirFolders"`
	Breadcrumbs []SysFile   `json:"breadcrumbs"`
	Error       SimpleError `json:"error"`
}

type PastFileResponse struct {
	File  SysFile     `json:"file"`
	Error SimpleError `json:"error"`
}
