import React from "react";
import pythonLogo from "./python-logo.svg"
import golangLogo from "./golang-logo.svg"
import hardBadge from "./bytesHard.svg";

export type ByteBadgeProps = {
    language: string
};
function BytesLanguage(props: ByteBadgeProps) {

    const handleLanguage = () => {
        switch (props.language) {
            case "Python":
                return pythonLogo
            case "Go":
                return golangLogo
        }
    }

    const size = props.language === "Go" ? "30px" : "20px"
    return (
        <div style={{textAlign: "right"}}>
            <img alt="" src={handleLanguage()} style={{width: size, height: size}}/>
        </div>
    )
}

export default BytesLanguage;