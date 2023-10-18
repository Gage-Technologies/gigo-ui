import {DiJava, DiJavascript1, DiPython, DiReact} from 'react-icons/di';
import {VscJson} from 'react-icons/vsc';
import {SiCplusplus} from 'react-icons/si';
import {BiCode} from 'react-icons/bi';
import {RiHashtag} from 'react-icons/ri'

type FileIconOptions = {
    [key: string]: JSX.Element
}

const FILE_ICONS: FileIconOptions = {
    "js": <DiJavascript1 style={{color: "yellow"}}/>,
    "css": <RiHashtag style={{color: "blue", strokeWidth: ".3px", stroke: "black"}}/>,
    "html": <BiCode style={{color: "orange", strokeWidth: ".3px", stroke: "black"}}/>,
    "jsx": <DiReact style={{color: "cyan", strokeWidth: ".3px", stroke: "black"}}/>,
    "java": <DiJava style={{color: "red", strokeWidth: ".3px", stroke: "black"}}/>,
    "json": <VscJson style={{color: "darkorange"}}/>,
    "py": <DiPython style={{color: "sky", strokeWidth: ".3px", stroke: "black"}}/>,
    "cpp": <SiCplusplus style={{color: "sky", strokeWidth: ".3px", stroke: "black"}}/>

};

export default FILE_ICONS;