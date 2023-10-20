// https://leshak.github.io/svelte-icons-pack/#/search/pdf

// File & folder specific icons:
import AiFillFolder from "svelte-icons-pack/ai/AiFillFolder";
import AiOutlineDesktop from "svelte-icons-pack/ai/AiOutlineDesktop"; 
import AiFillFileImage from "svelte-icons-pack/ai/AiFillFileImage";
import AiFillFileZip from "svelte-icons-pack/ai/AiFillFileZip";
import AiFillFilePdf from "svelte-icons-pack/ai/AiFillFilePdf"; 

import HiOutlineDocument from "svelte-icons-pack/hi/HiOutlineDocument";
import HiSolidFolderDownload from "svelte-icons-pack/hi/HiSolidFolderDownload";

import RiMediaMusic2Fill from "svelte-icons-pack/ri/RiMediaMusic2Fill";
import RiMediaFilmFill from "svelte-icons-pack/ri/RiMediaFilmFill";
import RiBusinessWindowFill from "svelte-icons-pack/ri/RiBusinessWindowFill";

import BsFileEarmarkMusicFill from "svelte-icons-pack/bs/BsFileEarmarkMusicFill";
import BsTerminalFill from "svelte-icons-pack/bs/BsTerminalFill";
import BsFileEarmarkFontFill from "svelte-icons-pack/bs/BsFileEarmarkFontFill";
import BsFileEarmarkCodeFill from "svelte-icons-pack/bs/BsFileEarmarkCodeFill";

import FiHardDrive from "svelte-icons-pack/fi/FiHardDrive";

import IoDocument from "svelte-icons-pack/io/IoDocument";

import SiJson from "svelte-icons-pack/si/SiJson";

// Context menu specific icons:
import IoAddCircleSharp from "svelte-icons-pack/io/IoAddCircleSharp";
import FiExternalLink from "svelte-icons-pack/fi/FiExternalLink";
import BsScissors from "svelte-icons-pack/bs/BsScissors";
import FaCopy from "svelte-icons-pack/fa/FaCopy";
import FaSolidPaste from "svelte-icons-pack/fa/FaSolidPaste";
import BsInputCursorText from "svelte-icons-pack/bs/BsInputCursorText";
import FiTrash from "svelte-icons-pack/fi/FiTrash";
import RiDocumentFileSearchLine from "svelte-icons-pack/ri/RiDocumentFileSearchLine";


export const IconDictionary = {
	"folder":  AiFillFolder ,
	"folderDesktop": AiOutlineDesktop,
	"folderDownloads": HiSolidFolderDownload,
	"folderDocuments": HiOutlineDocument,
	"folderPictures": AiFillFileImage,
	"folderMusic": RiMediaMusic2Fill,
	"folderDisk": FiHardDrive,

	"file": IoDocument,
	"fileImage": AiFillFileImage,
	"fileAudio": BsFileEarmarkMusicFill,
	"fileVideo": RiMediaFilmFill,
	"fileCompressed": AiFillFileZip,
	"fileExecutable":RiBusinessWindowFill,
	"fileExecutableScript":BsTerminalFill,
	"fileFont":BsFileEarmarkFontFill,
	"fileCode":BsFileEarmarkCodeFill,
	"fileJson":SiJson,
	"filePdf":AiFillFilePdf,

	"ctxMenuAdd": IoAddCircleSharp,
	"ctxMenuOpen": FiExternalLink,
	"ctxMenuCut": BsScissors,
	"ctxMenuCopy": FaCopy,
	"ctxMenuPaste": FaSolidPaste,
	"ctxMenuRename": BsInputCursorText,
	"ctxMenuDelete": FiTrash,
	"ctxMenuProperties": RiDocumentFileSearchLine,
}

export function GetIconByType(ftype) {
	let icon = IconDictionary[ftype]
	if (ftype === undefined)
		return "file";

	return icon
}