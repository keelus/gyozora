package models

type LeftBarElement struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Path string `json:"path"`
}

type SysFile struct {
	Name        string `json:"name"`
	Extension   string `json:"extension"`
	Filename    string `json:"filename"`
	Permissions string `json:"permissions"`
	Path        string `json:"path"`
	PathFull    string `json:"pathfull"`
	Size        int    `json:"size"`
	IconClass   string `json:"iconClass"`
	IsFolder    bool   `json:"isFolder"`
	IsHidden    bool   `json:"isHidden"`
	CreatedAt   int    `json:"createdAt"`
	ModifiedAt  int    `json:"modifiedAt"`
	Preview     string `json:"preview"`
}
type Kirina struct {
	Name string `json:"name"`
	Age  uint8  `json:"age"`
}
