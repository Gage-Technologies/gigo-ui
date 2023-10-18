/* Chat message similar to twitch built in React with MUI */

import {Card, CardContent, createStyles, createTheme, Link, PaletteMode, Typography} from "@mui/material";
import randomColor from "randomcolor";
import MarkdownRenderer from "../Markdown/MarkdownRenderer";
import * as React from "react";
import {withStyles} from "@material-ui/core";
import moment from 'moment';
import {getAllTokens} from "../../theme";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
    gradientText: {
        background: "linear-gradient(90deg, black 25%, gold 50%, black 75%)",
        backgroundSize: "200% 100%",
        fontWeight: "bold",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "$gradient 5s linear infinite",
    },
    "@keyframes gradient": {
        "0%": {
            backgroundPosition: "200% 0",
        },
        "100%": {
            backgroundPosition: "0% 0",
        },
    },
});

interface IProps {
    _id: string,
    sender: boolean,
    username: string,
    userRenown: number,
    content: string,
    date: Date,
    releaseMem: boolean,
    onAllMediaLoaded: () => void,
    listRef: React.MutableRefObject<HTMLDivElement | null>,
}

export default function ChatMessage(props: IProps) {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const messageRef = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(true);
    const [messageHeight, setMessageHeight] = React.useState<number | null>(null);

    const StyledCardContent = withStyles(() =>
        createStyles({
            root: {
                padding: "4px !important",
                "&:last-child": {
                    paddingBottom: "4px !important",
                },
            },
        })
    )(CardContent);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                setIsVisible(entries[0].isIntersecting);
            },
            {
                root: props.listRef.current,
                // rootMargin: "500px 0px 500px 0px",
                rootMargin: "0px",
                threshold: 0.1,
            }
        );

        if (messageRef.current) {
            observer.observe(messageRef.current);
        }

        return () => {
            if (messageRef.current) {
                observer.unobserve(messageRef.current);
            }
        };
    }, [messageRef.current]);

    // React.useEffect(() => {
    //     const observer = new IntersectionObserver(
    //         (entries) => {
    //             setEnableAnimations(entries[0].isIntersecting);
    //         },
    //         {
    //             root: props.listRef.current,
    //             threshold: 0.1,
    //             // track objects that within the bottom half of the screen
    //             rootMargin: "0px 0px -50% 0px",
    //         }
    //     );
    //
    //     if (messageRef.current) {
    //         observer.observe(messageRef.current);
    //     }
    //
    //     return () => {
    //         if (messageRef.current) {
    //             observer.unobserve(messageRef.current);
    //         }
    //     };
    // }, [messageRef.current]);

    const classes = useStyles();

    const markdownRenderedCallback = () => {
        if (messageRef.current && messageHeight === null) {
            const height = messageRef.current.offsetHeight;
            setMessageHeight(height);
            props.onAllMediaLoaded();
        }
    };

    /**
     * Formats the date into one of the following formats:
     * - Today HH:MM AM/PM
     * - MM/DD/YYYY HH:MM AM/PM
     * */
    const formatDate = (date: Date): string => {
        let now = moment();
        let passedDate = moment(date);


        if (now.isSame(passedDate, 'day')) {
            // format as "Today HH:MM AM/PM"
            return 'Today ' + passedDate.format('hh:mm A');
        } else if (now.subtract(1, 'days').isSame(passedDate, 'day')) {
            // format as "Yesterday HH:MM AM/PM"
            return 'Yesterday ' + passedDate.format('hh:mm A');
        } else {
            // format as "MM/DD/YYYY HH:MM AM/PM"
            return passedDate.format('MM/DD/YYYY hh:mm A');
        }
    }

    /**
     * Selects a color using the renown of the author
     * */
    const selectColor = (renown: number): string => {
        switch (renown) {
            default:
                return "#3CC18C"
            case 1:
                return "#3CBEC1"
            case 2:
                return "#3C85C1"
            case 3:
                return "#463CC1"
            case 4:
                return "#863CC1"
            case 5:
                return "#C13CB2"
            case 6:
                return "#C13C40"
            case 7:
                return "#C1673C"
            case 8:
                return "#C19D3C"
        }
    }

    const formatName = () => {
        if (props.userRenown === 9) {
            return (
                <Link
                    href={`/user/${props.username}`}
                    className={classes.gradientText}
                    sx={{
                        fontWeight: "bold",
                        textDecoration: "none",
                    }}
                >
                    {props.username}
                </Link>
            );
        }
        return (
            <Link
                href={`/user/${props.username}`}
                sx={{
                    color: selectColor(props.userRenown),
                    fontWeight: "bold",
                    textDecoration: "none",
                }}
            >
                {props.username}
            </Link>
        );
    };

    const renderMessage = () => {
        if (props.releaseMem && !isVisible && messageHeight !== null) {
            return (
                <div style={{ height: `${messageHeight}px` }} />
            );
        }

        // detect any @mentions in the content and replace them with html to highlight them
        let content = props.content;
        content = content.replace(/@(?!everyone\b)([a-zA-Z0-9_]+)/g, `<a href="/user/$1" style="background-color: rgba(159,60,255,0.25); border-radius: 5px; padding: 3px; color: ${theme.palette.text.primary};">@$1</a>`);
        // handle the channel but not linking and setting a different background color
        content = content.replace(/@everyone/g, `<span style="background-color: rgba(255,95,95,0.25); border-radius: 5px; padding: 3px; color: ${theme.palette.text.primary};">@everyone</span>`);

        return (
            <>
                <StyledCardContent>
                    <Typography variant="body2" gutterBottom style={{ textAlign: props.sender ? 'right' : 'left' }}>
                        {formatName()}
                        {" "}
                        <span style={{ fontSize: "11px", color: theme.palette.text.secondary }}>{formatDate(props.date)}</span>
                    </Typography>
                    <div
                        style={{
                            width: "fit-content",
                            float: props.sender ? "right" : "left",
                        }}
                    >
                        <MarkdownRenderer
                            markdown={content}
                            style={{
                                fontSize: "0.8rem",
                                width: "fit-content",
                                maxWidth: "287px",
                            }}
                            onAllMediaLoaded={markdownRenderedCallback}
                            imgProxy={`/insecure/rs:auto:278/g:sm/plain/`}
                        />
                    </div>
                </StyledCardContent>
            </>
        )
    }

    return (
        <Card
            ref={messageRef}
            sx={{
                display: "flex",
                marginLeft: "3px",
                marginRight: "3px",
                backgroundColor: "transparent",
                backgroundImage: "none",
                boxShadow: "none",
                flexDirection: props.sender ? "row-reverse" : "row",
            }}
        >
            {renderMessage()}
        </Card>
    );
}

// default props
ChatMessage.defaultProps = {
    onAllMediaLoaded: () => {},
    listRef: null,
    releaseMem: false,
}
