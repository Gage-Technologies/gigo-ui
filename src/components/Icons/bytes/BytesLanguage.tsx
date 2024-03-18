import React from "react";
import pythonLogo from "./python-logo.svg"
import golangLogo from "./golang-logo.svg"
import hardBadge from "./bytesHard.svg";
import { themeHelpers } from "../../../theme";

export type ByteBadgeProps = {
    language: string
};
function BytesLanguage(props: ByteBadgeProps) {

    const handleLanguage = () => {
        switch (props.language.toLowerCase()) {
            case "python":
            case "py":
                return pythonLogo
            case "golang":
            case "go":
                return golangLogo
        }
    }

    const size = props.language === "Go" ? "30px" : "20px"
    const containerPadding = props.language === "Go" ? "5px" : "10px"

    console.log("ByteBadge Props: ", props)
    return (
        <div style={{
            textAlign: "right", 
            // backgroundColor: "#00000040", 
            borderRadius: "50%", 
            width: "40px", 
            height: "40px",
            padding: containerPadding,
            ...themeHelpers.frostedGlass
        }}>
            <img alt="" src={handleLanguage()} style={{width: size, height: size}}/>
        </div>
    )
}

export default BytesLanguage;