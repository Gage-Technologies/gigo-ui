import React, { useCallback, useEffect, useState } from 'react';
import ChatMessage from "./ChatMessage";
import {
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    CircularProgress,
    createTheme,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    PaletteMode,
    Paper,
    Popover,
    Popper,
    styled,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { getAllTokens, themeHelpers } from "../../theme";
import { ArrowDownward, Delete, EmojiEmotions, Gif } from "@material-ui/icons";
import Tenor from "../Tenor";
import Emoji from "../Emoji";
import config from "../../config";
import * as models from "../../models/chat";
import { GetChatsParams } from "../../models/chat";
import * as wsModels from "../../models/websocket";
import call from "../../services/api-call";
import swal from "sweetalert";
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    selectAuthState,
    selectAuthStateId,
    selectAuthStateTier,
    selectAuthStateUserName,
    selectAuthStateRole
} from '../../reducers/auth/auth';
import ld from 'lodash';
import MoonLoader from 'react-spinners/MoonLoader';
import { useGlobalWebSocket } from '../../services/websocket';
import { selectCacheState, setCache } from "../../reducers/pageCache/pageCache";
import { selectMessageCacheState, setMessageCache } from "../../reducers/chat/cache";
import { initialChatStateUpdate, selectChatState, updateChatState } from "../../reducers/chat/chat";
import { useParams } from "react-router";
import {
    differenceInHours,
    differenceInMinutes,
    format,
    isBefore,
    isWithinInterval,
    subDays,
    subHours,
    subMinutes,
    subYears
} from 'date-fns';
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { ArrowForward, Check, Close, VolumeOff, VolumeUp } from '@mui/icons-material';
import User from '../../models/user';
import UserIcon from '../UserIcon';
import renown1 from "../../img/renown/renown1.svg"
import renown2 from "../../img/renown/renown2.svg"
import renown3 from "../../img/renown/renown3.svg"
import renown4 from "../../img/renown/renown4.svg"
import renown5 from "../../img/renown/renown5.svg"
import renown6 from "../../img/renown/renown6.svg"
import renown7 from "../../img/renown/renown7.svg"
import renown8 from "../../img/renown/renown8.svg"
import renown9 from "../../img/renown/renown9.svg"
import renown10 from "../../img/renown/renown10.svg"
import { LoadingButton } from "@mui/lab";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Snackbar } from "@material-ui/core";
import Slide, { SlideProps } from '@mui/material/Slide';
import ReactDOM from "react-dom";
import {
    initialAppWrapperStateUpdate,
    selectAppWrapperChatOpen,
    updateAppWrapper
} from "../../reducers/appWrapper/appWrapper";
import Menu from "@mui/material/Menu";

type TransitionProps = Omit<SlideProps, 'direction'>;

function TransitionLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />;
}

const handleRenownCheck = (renown: number) => {
    let imgSrc;
    switch (renown) {
        case 0:
            imgSrc = renown1;
            break;
        case 1:
            imgSrc = renown2;
            break;
        case 2:
            imgSrc = renown3;
            break;
        case 3:
            imgSrc = renown4;
            break;
        case 4:
            imgSrc = renown5;
            break;
        case 5:
            imgSrc = renown6;
            break;
        case 6:
            imgSrc = renown7;
            break;
        case 7:
            imgSrc = renown8;
            break;
        case 8:
            imgSrc = renown9;
            break;
        case 9:
            imgSrc = renown10;
            break;
        default:
            imgSrc = renown10;
            break;

    }
    return imgSrc;
}

const preProcessMessages = (m: models.ChatMessage[]): models.ChatMessage[] => {
    // filter duplicate messages and messages that have an empty id or author id
    let uniqueMessages = new Map<string, models.ChatMessage>();
    m.forEach((e: models.ChatMessage) => {
        if (e._id !== "" && e.author_id !== "") {
            uniqueMessages.set(e._id, e);
        }
    });
    m = Array.from(uniqueMessages.values());

    // sort the messages by created_at then by id on conflict
    m.sort((a: models.ChatMessage, b: models.ChatMessage) => {
        return new Date(a.created_at) > new Date(b.created_at) ? 1 : -1;
    });

    return m;
}

function compareMessageIDs(id1: string, id2: string) {
    const maxLength = Math.max(id1.length, id2.length);
    const paddedStr1 = id1.padStart(maxLength, '0');
    const paddedStr2 = id2.padStart(maxLength, '0');

    if (paddedStr1 < paddedStr2) {
        return -1;
    }
    if (paddedStr1 > paddedStr2) {
        return 1;
    }
    return 0;
}

export default function ChatContainer() {
    let userPref = localStorage.getItem('theme')
    const [mode, _] = React.useState<PaletteMode>(userPref === 'light' ? 'light' : 'dark');
    const theme = React.useMemo(() => createTheme(getAllTokens(mode)), [mode]);

    const SearchIconWrapper = styled('div')(() => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.primary
    }));

    const Search = styled('div')(() => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.text.primary, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.25),
        },
        marginRight: theme.spacing(2),
        // marginTop: 10,
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));

    const StyledInputBase = styled(InputBase)(() => ({
        color: theme.palette.text.primary,
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '200%',
            [theme.breakpoints.up('md')]: {
                width: '50ch',
            },
        },
    }));

    const dispatch = useAppDispatch();
    const cache = useAppSelector(selectCacheState);
    const messageCache = useAppSelector(selectMessageCacheState);
    const persistedState = useAppSelector(selectChatState);

    const authorId = useAppSelector(selectAuthStateId);
    const authorName = useAppSelector(selectAuthStateUserName);
    const authorRenown = useAppSelector(selectAuthStateTier);
    const authorRole = useAppSelector(selectAuthStateRole);

    console.log("auth role: ", authorRole)

    const chatOpen = useAppSelector(selectAppWrapperChatOpen);

    let loggedIn = false
    const authState = useAppSelector(selectAuthState);
    if (authState.authenticated !== false) {
        loggedIn = true
    }

    let cacheKey = `chatContainer::${loggedIn ? authorId : "anon"}`;

    let globalWs = useGlobalWebSocket();

    const [chat, setChat] = React.useState<models.Chat>(
        persistedState.selectedChat !== undefined ? persistedState.selectedChat : {
            _id: "0",
            name: "Global",
            type: models.ChatType.ChatTypeGlobal,
            users: [],
            user_names: [],
            last_message: null,
            last_message_time: null,
            icon: null,
            last_read_message: null,
            muted: false,
        }
    );
    const [messages, setMessages] = React.useState<models.ChatMessage[]>(
        cache[`${cacheKey}:${chat._id}:messages`] !== undefined ? cache[`${cacheKey}:${chat._id}:messages`].data as models.ChatMessage[] : []
    );

    const [bootstrapped, setBootstrapped] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = useState(
        messageCache[chat._id] !== undefined && messageCache[chat._id].message !== undefined ? messageCache[chat._id].message as string : ""
    );
    const [showGifPicker, setShowGifPicker] = useState(false); // State variable to control GIF picker
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State variable to control emoji picker
    const [showJumpToBottom, setShowJumpToBottom] = useState(false); // State variable for showing "Jump to Bottom" button
    const [userScrolledUp, setUserScrolledUp] = useState(false); // State variable to track whether the user has manually scrolled up
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingNewChat, setLoadingNewChat] = useState(false);
    const [noMoreData, setNoMoreData] = useState(false); // State variable to track whether there is more data to load
    const [autoScrolling, setAutoScrolling] = useState(true); // State variable to track whether the user is auto scrolling
    const [sendingMessage, setSendingMessage] = useState(false);

    const containerEndRef = React.useRef<HTMLDivElement>(null);
    const listContainerRef = React.useRef<HTMLDivElement>(null); // Ref for the list container
    const messageInputContainerRef = React.useRef<HTMLInputElement>(null); // Ref for the message input container
    const scrollRef = React.useRef({ prevScrollHeight: 0, prevScrollTop: 0 });

    const [selectedTab, setSelectedTab] = React.useState(persistedState.selectedTab);
    const [privateChatView, setPrivateChatView] = React.useState(persistedState.privateChatView);

    const [chats, setChats] = React.useState<models.Chat[]>([]);

    const autoCompleteRef = React.useRef<HTMLInputElement>(null);
    const [friendSearchOptions, setFriendSearchOptions] = React.useState<User[]>([]);
    const [mentionSearchOptions, setMentionSearchOptions] = React.useState<User[]>([]);
    const [newChatnchorEl, setNewChatnchorEl] = React.useState<HTMLElement | null>(null);
    const [friendNameQuery, setFriendNameQuery] = React.useState<string>("");
    const [newChatSelectedFriends, setNewChatSelectedFriends] = React.useState<User[]>([]);
    const [editingChatName, setEditingChatName] = React.useState<string | null>(null);
    const [chatClickTimeout, setChatClickTimeout] = React.useState<NodeJS.Timeout | null>(null);
    const [newChatName, setNewChatName] = React.useState<string>("");
    const chatNameEditRef = React.useRef<HTMLInputElement>(null);
    const [challengeSub, setChallengeSub] = React.useState<string | null>(null);
    const [mentionSelectionPopperOpen, setMentionSelectionPopperOpen] = React.useState<boolean>(false);
    const [mentionOptionIndex, setMentionOptionIndex] = React.useState<number | null>(null);
    const [notification, setNotification] = React.useState<{
        chat: models.Chat | null,
        msg: models.ChatMessage | null,
        event: models.ChatUpdateEventMessage | null
    } | null>(null);
    const listItemRefs = React.useRef(new Map());

    // always start at the bottom when the chat is opened
    useEffect(() => {
        // exit if we are not in a chat view
        if (selectedTab === "Friends" && !privateChatView) {
            return
        }

        if (chatOpen) {
            scrollToBottom();
        }
    }, [chatOpen]);

    useEffect(() => {
        if (mentionOptionIndex === null) {
            return;
        }
        let iv = inputValue.split("@");
        let renderEverythingOption = iv.length > 1 && "everyone".startsWith(iv[iv.length - 1])
        if (renderEverythingOption && mentionOptionIndex === 0) {
            const currentRef = listItemRefs.current.get("everyone");
            currentRef?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
        } else {
            let r = mentionSearchOptions[mentionOptionIndex + (renderEverythingOption ? 1 : 0)];
            if (r === undefined) {
                return;
            }
            const currentRef = listItemRefs.current.get(r._id);
            currentRef?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'start' });
        }
    }, [mentionOptionIndex, inputValue]);

    const chatUpdateEventCallback = useCallback((msg: wsModels.WsMessage<any>) => {
        let update = msg.payload as models.ChatUpdateEventMessage;
        // skip if we are the updater
        if (update.updater.toLowerCase() === authorName.toLowerCase()) {
            return;
        }

        // NOTE: removals and additions are handled via other messages

        // if this is not a deletion then update the chat
        let updateChat = true;
        for (let i = 0; i < update.update_events.length; i++) {
            // if we ever see a delete then set chat update false and exit so we don't conflict with a kick message
            if (update.update_events[i] === models.ChatUpdateEvent.ChatUpdateEventDeleted) {
                updateChat = false;
                break;
            }
        }
        if (updateChat) {
            let index = chats.findIndex((e: models.Chat) => e._id === update.chat._id);
            if (index !== -1) {
                let c = JSON.parse(JSON.stringify(chats));
                c[index] = update.chat;
                setChats(c);
            }

            // if this is the active chat then update the chat name
            if (chat._id === update.chat._id) {
                setChat(update.chat);
            }
        }

        setNotification({
            chat: null,
            msg: null,
            event: update,
        })
    }, [chats, chat, authorName]);
    globalWs.registerCallback(wsModels.WsMessageType.ChatUpdatedEvent, "chat:update-event", chatUpdateEventCallback);

    const chatIncomingCallback = useCallback((msg: wsModels.WsMessage<any>) => {
        // update the messages with the payload only if we are focused on the chat
        let newMessage = msg.payload as models.ChatMessage
        let markRead = false;
        if (newMessage.chat_id === chat._id && privateChatView) {
            let m = JSON.parse(JSON.stringify(messages));
            m.push(newMessage);
            m = preProcessMessages(m);
            setMessages(m);

            // send read message to server
            let wsMsg: wsModels.WsMessage<any> = {
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: wsModels.WsMessageType.UpdateReadMessage,
                payload: {
                    chat_id: chat._id,
                    message_id: newMessage._id,
                }
            }
            globalWs.sendWebsocketMessage(wsMsg, null);

            markRead = true;
        }

        // update the corresponding chat with the last message time
        let c = JSON.parse(JSON.stringify(chats));
        let chatIndex = c.findIndex((e: models.Chat) => e._id === newMessage.chat_id);
        if (chatIndex !== -1) {
            c[chatIndex].last_message_time = newMessage.created_at;
            c[chatIndex].last_message = newMessage._id;

            let sendNotification = !c[chatIndex].muted;
            if (sendNotification) {
                sendNotification = !markRead;
            }
            if (!sendNotification) {
                // detect if we have been mentioned by checking for our username in the message prefaced by an @
                if (newMessage.message.toLowerCase().includes("@<" + authorName.toLowerCase() + ">") ||
                    newMessage.message.toLowerCase().includes("@everyone")) {
                    // override mute
                    sendNotification = true;
                }
            }

            if (markRead) {
                c[chatIndex].last_read_message = newMessage._id;
            }

            if (sendNotification) {
                let n = {
                    chat: c[chatIndex],
                    msg: newMessage,
                    event: null,
                }
                setNotification(n);
            }
            setChats(c);
        }
    }, [messages, chat, chats, privateChatView]);
    globalWs.registerCallback(wsModels.WsMessageType.NewIncomingChatMessage, "chat:incoming", chatIncomingCallback);

    const kickChatCallback = useCallback((msg: wsModels.WsMessage<any>) => {
        let c = JSON.parse(JSON.stringify(chats));
        let kick = msg.payload as models.KickChatMessage;
        let index = c.findIndex((e: models.Chat) => e._id === kick.chat_id);
        if (index !== -1) {
            c.splice(index, 1);
            setChats(c);

            // handle the case that the user is in the chat
            if (chat._id === kick.chat_id) {
                setChat(JSON.parse(JSON.stringify({
                    _id: "0",
                    name: "Global",
                    type: models.ChatType.ChatTypeGlobal,
                    users: [],
                    user_names: [],
                    last_message: null,
                    last_message_time: null,
                    icon: null,
                    last_read_message: null,
                    muted: false,
                })));
                setBootstrapped(false);
                setPrivateChatView(false);
            }
        }
    }, [chats, chat]);
    globalWs.registerCallback(wsModels.WsMessageType.KickChat, "chat:kick", kickChatCallback);

    const broadcastChatCallback = useCallback((msg: wsModels.WsMessage<any>) => {
        let c = JSON.parse(JSON.stringify(chats));
        let newChat = msg.payload as models.Chat;
        // skip if we already have the chat
        if (c.findIndex((e: models.Chat) => e._id === newChat._id) !== -1) {
            return;
        }
        c.push(newChat);
        setChats(c);
    }, [chats]);
    globalWs.registerCallback(wsModels.WsMessageType.NewChatBroadcast, "chat:broadcast", broadcastChatCallback);

    // trigger a load for the chats on start
    useEffect(() => {
        if (chats.length > 0 || !loggedIn) {
            return
        }

        setLoadingChats(true);

        globalWs.sendWebsocketMessage({
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: wsModels.WsMessageType.GetChats,
            payload: {
                offset: 0,
                limit: 250,
            } as GetChatsParams,
        }, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.GetChats) {
                let c = msg.payload as models.GetChatsResponse;
                setChats(c.chats);
                setLoadingChats(false);
                return;
            }

            // handle error case
            setLoadingChats(false);
            swal("Server Error", "The server said you have no chats but we know your popular. We'll have a talk with that server!");
        })
    }, []);

    const handleNewChatClick = (event: React.MouseEvent<HTMLElement>) => {
        setNewChatnchorEl(event.currentTarget);
    };

    const handleNewChatClose = () => {
        setNewChatnchorEl(null);
        setFriendNameQuery("");
    };

    const newChatOpen = Boolean(newChatnchorEl);
    const newChatPopoverId = newChatOpen ? 'new-chat-popover' : undefined;

    const [chatSelectionRightClickAnchorEl, setChatSelectionRightClickAnchorEl] = useState<null | HTMLElement>(null);
    const [chatEdit, setChatEdit] = useState<models.Chat | null>(null);
    const [chatDeleteLoading, setChatDeleteLoading] = useState<boolean>(false);
    const [chatMuteLoading, setChatMuteLoading] = useState<boolean>(false);
    const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);

    const handleChatSelectionRightClick = (chat: models.Chat, event: MouseEvent) => {
        event.preventDefault(); // Prevent the default context menu from appearing
        setChatEdit(chat);
        setChatSelectionRightClickAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleChatSelectionRightClickClose = () => {
        setChatEdit(null);
        setConfirmingDelete(false);
        setChatSelectionRightClickAnchorEl(null);
    };

    let { id } = useParams();


    // debounce for dispatch calls
    const dispatchDebounceSetCache = ld.debounce((key: string, value: any) => {
        dispatch(setCache(key, value));
    }, 1000);


    // configure functions to update the cache
    useEffect(() => {
        dispatchDebounceSetCache(`${cacheKey}:messages`, messages)
    }, [messages]);

    // auto update the input value when the chat changes
    useEffect(() => {
        dispatch(setMessageCache(chat._id, inputValue));
        let s = JSON.parse(JSON.stringify(initialChatStateUpdate));
        s.selectedChat = chat;
        dispatch(updateChatState(s));
        setInputValue(messageCache[chat._id] !== undefined && messageCache[chat._id].message !== undefined ? messageCache[chat._id].message as string : "")
    }, [chat]);

    // auto update private chat view
    useEffect(() => {
        let s = JSON.parse(JSON.stringify(initialChatStateUpdate));
        s.privateChatView = privateChatView;
        dispatch(updateChatState(s));
    }, [privateChatView]);

    // auto update selected tab
    useEffect(() => {
        let s = JSON.parse(JSON.stringify(initialChatStateUpdate));
        s.selectedTab = selectedTab;
        dispatch(updateChatState(s));
    }, [selectedTab]);

    const switchTab = (tab: string) => {
        setPrivateChatView(false);
        setSelectedTab(tab);

        if (tab === "Challenge") {
            // validate the url is a challenge url and if so retrieve the id from the url
            let challengeId = "";
            if (!window.location.pathname.includes("/challenge/")) {
                switchTab("Global");
                return;
            }

            // manually parse id from url
            let id = window.location.pathname.split("/")[2];
            id = id.split("?")[0];
            id = id.split("#")[0];
            if (id === "") {
                switchTab("Global");
                return;
            }
            challengeId = id;

            setChat(JSON.parse(JSON.stringify({
                _id: challengeId,
                name: "Challenge",
                type: models.ChatType.ChatTypeChallenge,
                users: [],
                user_names: [],
                last_message_time: null,
                icon: null,
            })));
            setBootstrapped(false);
        }

        if (tab === "Global") {
            setChat(JSON.parse(JSON.stringify({
                _id: "0",
                name: "Global",
                type: models.ChatType.ChatTypeGlobal,
                users: [],
                user_names: [],
                last_message_time: null,
                icon: null,
            })));
            setBootstrapped(false);
        }
    }


    const scrollToBottom = () => {
        setAutoScrolling(true)
        const container = listContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
        // TODO: look into why this takes a double sclick and if we can speed it up
        // containerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUserScrolledUp(false); // Reset the userScrolledUp state variable
        setAutoScrolling(false); // Reset the autoScrolling state variable
    };

    const searchFriends = async (query: string) => {
        let res = await call(
            "/api/search/friends",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                query: query,
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["users"] === undefined) {
            swal("Server Error", "Something funky is afoot. We better get runnin'!")
            return;
        }

        let users: User[] = res["users"];
        setFriendSearchOptions(users);
    }

    const searchChatUsers = async (query: string) => {
        let res = await call(
            "/api/search/chatUsers",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                chat_id: chat._id,
                query: query,
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["users"] === undefined) {
            swal("Server Error", "Something funky is afoot. We better get runnin'!")
            return;
        }

        let users: User[] = res["users"];
        setMentionSearchOptions(users);
    }

    const searchChatUsersPublic = async (query: string) => {
        let res = await call(
            "/api/search/users",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                skip: 0,
                limit: 10,
                query: query,
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["users"] === undefined) {
            swal("Server Error", "Something funky is afoot. We better get runnin'!")
            return;
        }

        let users: User[] = res["users"];
        setMentionSearchOptions(users);
    }

    const searchUsersPublic = async (query: string) => {
        let res = await call(
            "/api/search/users",
            "POST",
            null,
            null,
            null,
            // @ts-ignore
            {
                skip: 0,
                limit: 10,
                query: query,
            },
            null,
            config.rootPath
        )

        if (res === undefined) {
            swal("Server Error", "We can't get in touch with the GIGO servers right now. Sorry about that! " +
                "We'll get crackin' on that right away!")
            return
        }

        if (res["users"] === undefined) {
            swal("Server Error", "Something funky is afoot. We better get runnin'!")
            return;
        }

        let users: User[] = res["users"];
        setFriendSearchOptions(users);
    }

    const getNextMessageBlock = async (override: boolean, lastMessageTime: Date | null = null) => {
        // Check if a call is already in progress or if there is no more data to load
        if (!override && (loadingMessages || noMoreData)) {
            return;
        }

        setLoadingMessages(true); // Set to true to indicate that a call is in progress

        if (lastMessageTime === null) {
            lastMessageTime = new Date();
            if (messages.length > 0) {
                // convert go timestamp string to js date
                let lastMessageTime = new Date(messages[0].created_at);

                // get the oldest created_at time from the messages
                for (let i = 1; i < messages.length; i++) {
                    if (new Date(messages[i].created_at) < lastMessageTime) {
                        lastMessageTime = new Date(messages[i].created_at);
                    }
                }
            }
        }

        // generate a random alphanumeric id
        let seqId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let wsMsg: wsModels.WsMessage<any> = {
            sequence_id: seqId,
            type: wsModels.WsMessageType.GetChatMessages,
            payload: {
                chat_id: chat._id,
                timestamp: lastMessageTime,
                descending: true,
                limit: 50,
            }
        };
        globalWs.sendWebsocketMessage(wsMsg, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.GetChatMessages) {
                let m = msg.payload as models.GetChatMessagesResponse;
                if (m.messages.length === 0) {
                    setNoMoreData(true);
                    setLoadingMessages(false);
                    return;
                }
                let oldMessageLength = messages.length;
                if (!override && oldMessageLength > 0) {
                    m.messages.push(...JSON.parse(JSON.stringify(messages)));
                }
                let msgs = preProcessMessages(m.messages);

                setMessages(msgs);
                setLoadingMessages(false);
                if (override || oldMessageLength === 0) {
                    // update the active chat with the latest message and read message
                    let c = JSON.parse(JSON.stringify(chats));
                    let chatIndex = c.findIndex((e: models.Chat) => e._id === chat._id);
                    if (chatIndex !== -1) {
                        c[chatIndex].last_message_time = msgs[msgs.length - 1].created_at;
                        c[chatIndex].last_message = msgs[msgs.length - 1]._id;
                        c[chatIndex].last_read_message = msgs[msgs.length - 1]._id;
                        setChats(c);
                    }

                    // exit if we are not in a chat view
                    if (selectedTab === "Friends" && !privateChatView) {
                        return
                    }

                    scrollToBottom();
                }
                return
            }

            // handle error case
            // swal("Server Error", "The server said you have no messages but we know your inbox is full! We'll get right on that!");
            setLoadingMessages(false);
            return
        });
    }

    const handleSendMessage = ld.debounce((content: string | null = null, manual: boolean = true) => {
        let m = JSON.parse(JSON.stringify(messages));
        // generate a random alphanumeric id
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        if (content === null) {
            content = inputValue;
        }

        m.push({
            _id: id,
            chat_id: chat._id,
            author_id: authorId,
            author: authorName,
            author_renown: authorRenown,
            message: content,
            created_at: new Date(),
            revision: 0,
            type: models.ChatMessageType.ChatMessageTypeInsecure
        });
        m = preProcessMessages(m);
        setMessages(m);
        if (manual) {
            setInputValue(''); // Clear the input field
            setSendingMessage(false);
        }
        let wsMsg: wsModels.WsMessage<any> = {
            sequence_id: id,
            type: wsModels.WsMessageType.NewOutgoingChatMessage,
            payload: {
                chat_id: chat._id,
                content: content,
                message_type: models.ChatMessageType.ChatMessageTypeInsecure,
            }
        };
        globalWs.sendWebsocketMessage(wsMsg, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.NewOutgoingChatMessage) {
                // update the message with the server message
                let newMessage = msg.payload as models.ChatMessage
                let m = JSON.parse(JSON.stringify(messages));
                let index = m.findIndex((e: models.ChatMessage) => e._id === msg.sequence_id);
                if (index !== -1) {
                    m[index] = newMessage;
                    m = preProcessMessages(m);
                    setMessages(m);
                }

                // update the corresponding chat with the last message time
                let c: models.Chat[] = JSON.parse(JSON.stringify(chats));
                let chatIndex = c.findIndex((e: models.Chat) => e._id === chat._id);
                if (chatIndex !== -1) {
                    c[chatIndex].last_message_time = newMessage.created_at;
                    c[chatIndex].last_message = newMessage._id;
                    c[chatIndex].last_read_message = newMessage._id;
                    setChats(c);
                }

                // clear the message cache
                dispatch(setMessageCache(chat._id, ""));

                return;
            }

            // check if any existing messages have this sequence id
            let m = JSON.parse(JSON.stringify(messages));
            let index = m.findIndex((e: models.ChatMessage) => e._id === msg.sequence_id);
            if (index !== -1) {
                // if so, remove the message
                m.splice(index, 1);
                m = preProcessMessages(m);
                setMessages(m);
            }
            // alert the user
            swal("Failed To Send Message", "We lost the message in transit. It's like the USPS but more high tech! Sorry about that!");
        });
    }, 100);

    const addEmoji = (emoji: any) => {
        if ('native' in emoji) {
            setInputValue(inputValue + emoji.native);
        }
    };

    const sendGif = (gif: string) => {
        handleSendMessage(gif, false);
        setShowGifPicker(false);
    }

    let lastScrollTop = 0;

    const handleScroll = ld.throttle(() => {
        const container = listContainerRef.current;
        if (container) {
            if (Math.abs(container.scrollTop - lastScrollTop) < 10) {
                return; // Ignore if the change in scroll position is less than 10
            }
            lastScrollTop = container.scrollTop;

            if (container && container.scrollTop < 10 && !autoScrolling && bootstrapped) {
                scrollRef.current.prevScrollHeight = container.scrollHeight;
                scrollRef.current.prevScrollTop = container.scrollTop;
                getNextMessageBlock(false); // Call the function to get the next block of messages
            }

            // set scroll threshold for desktop and mobile
            let scrollThresholdDesktop = window.innerWidth > 1000 ? 100 : 80;

            // Determine if the user has scrolled up
            const scrolledUp = container.scrollTop < container.scrollHeight - container.clientHeight - scrollThresholdDesktop;
            const shouldShowJumpToBottom = container.scrollTop < container.scrollHeight - container.clientHeight - scrollThresholdDesktop;

            // Update userScrolledUp based on scroll position
            setUserScrolledUp(scrolledUp);
            // Show "Jump to Bottom" button if scrolled up, hide if scrolled down
            setShowJumpToBottom(shouldShowJumpToBottom);
        }
    }, 200);

    // Effect to call getNextMessageBlock on start
    useEffect(() => {
        setNoMoreData(false);
        setMessages(cache[`${cacheKey}:${chat._id}:messages`] !== undefined ? cache[`${cacheKey}:${chat._id}:messages`].data as models.ChatMessage[] : []);

        // if this chat is different from the challenge sub then unsubscribe from the challenge sub
        if (challengeSub !== null && challengeSub !== "" && challengeSub !== chat._id) {
            globalWs.sendWebsocketMessage({
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: wsModels.WsMessageType.ChatUnsubscribe,
                payload: {
                    chat_id: challengeSub,
                }
            }, (msg: wsModels.WsMessage<any>) => {
                if (msg.type === wsModels.WsMessageType.ChatUnsubscribe) {
                    // set challenge sub
                    setChallengeSub(null);
                    return;
                }

                // handle error case
                swal("Server Error", "The chat server for this challenge is on vacation. We'll call it back from the beach!");
            });
        }

        // if this is a challenge chat then we need to subscribe to the challenge chat
        if (chat.type === models.ChatType.ChatTypeChallenge) {
            globalWs.sendWebsocketMessage({
                sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                type: wsModels.WsMessageType.ChatSubscribe,
                payload: {
                    chat_id: chat._id,
                    chat_type: chat.type,
                }
            }, (msg: wsModels.WsMessage<any>) => {
                if (msg.type === wsModels.WsMessageType.ChatSubscribe) {
                    // extract chat from payload
                    let c = msg.payload as models.ChatSubscribeResponse;

                    // set challenge sub
                    setChallengeSub(c.chat._id);
                    return;
                }

                // handle error case
                swal("Server Error", "The chat server for this challenge is on vacation. We'll call it back from the beach!");
            });
        }

        getNextMessageBlock(true);
    }, [chat]); // Empty dependency array ensures this runs only on mount

    // Effect to scroll to the bottom when messages are updated, unless the user has manually scrolled up
    useEffect(() => {
        // only handle if the user has not manually scrolled up
        if (userScrolledUp) {
            return
        }

        // exit if we are not in a chat view
        if (selectedTab === "Friends" && !privateChatView) {
            return
        }

        // mark bootstrapped as true
        if (!bootstrapped)
            setBootstrapped(true);

        // scroll to the bottom gracefully
        scrollToBottom();
        return
    }, [messages]); // Re-run the effect when the messages change

    // Effect to set up the MutationObserver
    useEffect(() => {
        // exit if we are not in a chat view
        if (selectedTab === "Friends" && !privateChatView) {
            return
        }

        const container = listContainerRef.current;
        if (container) {
            const observer = new MutationObserver((mutations) => {
                // exit if we are not in a chat view
                if (selectedTab === "Friends" && !privateChatView) {
                    return
                }

                // trigger if we are within 10px of the top of the container or loading messages but not auto scrolling
                // this is basically our way of saying that the data is likely to be changing now or in the near future
                // but if we are auto scrolling then it doesn't matter because we are going to scroll to the bottom anyway
                if ((container.scrollTop < 10 || loadingMessages)) {
                    let scrollChange = 0
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            // Recalculate the scroll position here
                            scrollChange += scrollRef.current.prevScrollTop + (container.scrollHeight - scrollRef.current.prevScrollHeight);
                        }
                        if (mutation.removedNodes.length > 0) {
                            // Recalculate the scroll position here
                            scrollChange += scrollRef.current.prevScrollTop - (container.scrollHeight - scrollRef.current.prevScrollHeight);
                        }
                    });
                    container.scrollTop = scrollChange;
                }
            });

            observer.observe(container, { childList: true, subtree: true });
            return () => observer.disconnect();
        }
    }, [listContainerRef.current]);

    // Effect to jump to the top on new message loading so the spinner is visible
    useEffect(() => {
        // only handle if the user has not manually scrolled up
        if (userScrolledUp) {
            return
        }

        // exit if we are not in a chat view
        if (selectedTab === "Friends" && !privateChatView) {
            return
        }

        if (loadingMessages) {
            scrollToBottom();
        }
    }, [loadingMessages]);

    const randomTag = () => {
        // generate a 6 digit random alpha-numeric string
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result
    }

    const renderTopBar = () => {
        // Initialize with the Global tab
        let tabs = ["Global"];

        // Append the Friends tab if we are logged in
        if (loggedIn) {
            tabs.push("Friends");
        }

        // Prepend the Challenge tab if we are on the /challenge page
        if (window.location.pathname.includes("/challenge")) {
            tabs.unshift("Challenge");
        }

        // If the selected tab isn't in the list then default to the Global tab
        if (!tabs.includes(selectedTab)) {
            switchTab("Global");
        }

        // If we only have one tab then don't render the top bar
        if (tabs.length === 1) {
            return <></>;
        }

        // Container width
        const containerWidth = window.innerWidth > 1000 ? 300 : window.innerWidth;
        // Space between tabs
        const space = 10;
        // Calculate the width of each tab
        const tabWidth = tabs.length === 2 ? (containerWidth - space) / 2 : (containerWidth - (tabs.length - 1) * space) / tabs.length;

        return (
            <Paper
                sx={{
                    position: 'fixed',
                    top: window.innerWidth > 1000 ? '64px' : '56px',
                    height: '48px',
                    zIndex: 1000,
                    width: `${containerWidth}px`,
                    borderRadius: '0px',
                    // @ts-ignore
                    backgroundColor: theme.palette.background.chat,
                }}
            >
                {tabs.map((tab, index) => (
                    <Box
                        key={`chat-tab-${tab}`}
                        sx={{
                            position: 'absolute',
                            left: `${index * (tabWidth + space)}px`, // Calculate the left position based on index, tab width and space
                            width: `${tabWidth}px`, // Set tab width
                            height: '32px',
                            borderBottom: '1px solid',
                            borderBottomColor: tab === selectedTab ? theme.palette.primary.main : theme.palette.text.primary,
                            cursor: 'pointer',
                            color: theme.palette.text.primary,
                            fontSize: '0.8rem',
                            backgroundColor: "transparent",
                            borderRadius: '0px',
                            padding: '0px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: "6px",
                            '&:hover': {
                                border: `1px solid ${theme.palette.primary.dark}75`,
                                backgroundColor: `${theme.palette.primary.dark}25`,
                                borderRadius: '10px',
                            },
                        }}
                        onClick={() => {
                            switchTab(tab);
                        }}
                    >
                        {tab}
                    </Box>
                ))}
            </Paper>
        );
    }

    const messageInputMemo = React.useMemo(() => {
        let iv = inputValue.split("@");
        let renderEverythingOption = iv.length > 1 && "everyone".startsWith(iv[iv.length - 1])

        return (
            <>
                <TextField
                    ref={messageInputContainerRef}
                    fullWidth
                    variant="outlined"
                    value={inputValue}
                    disabled={sendingMessage}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        const container = listContainerRef.current;

                        // Show user popper if the last word is starting with "@" and there is no space after the word
                        let parts = e.target.value.split("@");
                        if (parts.length > 1 && !parts[parts.length - 1].includes(" ") && parts[parts.length - 1] != "everyone") {
                            setMentionSelectionPopperOpen(true);

                            // Extract search term after "@"
                            if (chat.type === models.ChatType.ChatTypeGlobal ||
                                chat.type === models.ChatType.ChatTypeRegional ||
                                chat.type === models.ChatType.ChatTypeChallenge) {
                                searchChatUsersPublic(parts[parts.length - 1]);
                            } else {
                                searchChatUsers(parts[parts.length - 1]);
                            }
                        } else {
                            setMentionSelectionPopperOpen(false);
                            setMentionOptionIndex(null);
                        }
                    }}
                    placeholder="Type a message..."
                    multiline // Support for multi-line content
                    maxRows={10} // Maximum number of rows before scrolling
                    minRows={1} // Minimum number of rows before scrolling
                    onKeyDown={(e) => {
                        if (mentionSelectionPopperOpen) {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setMentionOptionIndex(prev => (prev === null || prev >= mentionSearchOptions.length - 1) ? 0 : prev + 1);
                            }
                            if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setMentionOptionIndex(prev => (prev === null || prev <= 0) ? mentionSearchOptions.length - 1 : prev - 1);
                            }
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (mentionOptionIndex !== null) {
                                    if (renderEverythingOption && mentionOptionIndex === 0) {
                                        setInputValue(inputValue.substring(0, inputValue.lastIndexOf("@") + 1) + "everyone ");
                                    } else {
                                        const selectedOption = mentionSearchOptions[mentionOptionIndex + (renderEverythingOption ? -1 : 0)];
                                        setInputValue(inputValue.substring(0, inputValue.lastIndexOf("@") + 1) + "<" + selectedOption.user_name + "> ");
                                    }
                                    setMentionSelectionPopperOpen(false);
                                    setMentionOptionIndex(null);
                                }
                            }
                        } else {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (inputValue.length <= 2000 && inputValue.length > 0) {
                                    setSendingMessage(true);
                                    handleSendMessage();
                                    scrollToBottom();
                                }

                                // on mobile close the chat when we send the message
                                if (window.innerWidth <= 1000 && document.activeElement instanceof HTMLElement) {
                                    document.activeElement.blur();
                                }
                            }
                            if (e.key === 'Tab') {
                                e.preventDefault();
                                setInputValue(inputValue + '    ');
                            }
                        }
                    }}
                    error={inputValue.length > 2000} // Set error state if input exceeds 2000 characters
                    helperText={inputValue.length > 2000 ? `${inputValue.length}/2000` : ''} // Display error message
                    InputProps={{
                        inputProps: {
                            style: {
                                paddingRight: "50px"
                            }
                        },
                        sx: {
                            fontSize: '0.8rem',
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                {sendingMessage ? (
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                                        <CircularProgress
                                            color='primary'
                                            size={20}
                                        />
                                    </div>
                                )
                                    :
                                    (
                                        <div style={{ position: 'absolute', bottom: '6px', right: '8px' }}>
                                            <IconButton
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)} // Toggle Emoji picker
                                                sx={{
                                                    fontSize: '0.8rem',
                                                    padding: '0', // Remove padding
                                                    minWidth: 'auto', // Remove minimum width
                                                    lineHeight: '1', // Adjust line height
                                                }}
                                            >
                                                <EmojiEmotions />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setShowGifPicker(!showGifPicker)} // Toggle GIF picker
                                                disabled={inputValue.length > 2000} // Disable button if input exceeds 2000 characters
                                            >
                                                <Gif /> {/* GIF icon */}
                                            </IconButton>
                                        </div>
                                    )
                                }
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: window.innerWidth > 1000 ? 1 : "50px", // Add margin bottom
                    }}
                />
                <Popper
                    open={mentionSelectionPopperOpen && mentionSearchOptions.length > 0}
                    anchorEl={messageInputContainerRef.current}
                    placement={window.innerWidth > 1000 ? "right-start" : "top"}
                    sx={{
                        zIndex: 6000,
                    }}
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 20],  // x, y offset
                            },
                        },
                    ]}
                >
                    <Box
                        sx={{
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            // @ts-ignore
                            backgroundColor: theme.palette.background.chat,
                            padding: theme.spacing(1),
                            borderRadius: "10px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3);",
                        }}
                    >
                        <Card
                            sx={{
                                backgroundColor: 'transparent',
                                backgroundImage: 'none',
                                boxShadow: 'none',
                                maxHeight: "200px",
                                overflowY: "auto",
                                width: window.innerWidth > 1000 ? undefined : "90vw"
                            }}
                        >
                            <List>
                                {renderEverythingOption && (
                                    <ListItem
                                        ref={(el) => listItemRefs.current.set("everyone", el)}
                                        style={{
                                            paddingBottom: '10px',
                                            paddingLeft: '10px',
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                        }}
                                    >
                                        <Card sx={{
                                            display: 'flex',
                                            textAlign: "left",
                                            width: "99%",
                                            height: 50,
                                            border: 1,
                                            borderColor: theme.palette.secondary.main + "75",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                            backgroundImage: "none",
                                            cursor: 'pointer',
                                            backgroundColor: mentionOptionIndex === 0 ? theme.palette.secondary.main + "25" : 'transparent',
                                            '&:hover': {
                                                backgroundColor: theme.palette.secondary.main + "25",
                                            }
                                        }}>
                                            <Button
                                                sx={{
                                                    width: "100%",
                                                    fontSize: "10px",
                                                    fontWeight: "light",
                                                    textTransform: "none",
                                                    whiteSpace: "nowrap",
                                                }}
                                                onClick={async () => {
                                                    // merge the username into the input value
                                                    let inputValueCopy = inputValue;

                                                    // find the last @
                                                    let lastAt = inputValueCopy.lastIndexOf("@");
                                                    if (lastAt === -1) {
                                                        return;
                                                    }

                                                    // replace all of the text after the last @ with the username
                                                    inputValueCopy = inputValueCopy.substring(0, lastAt + 1) + "everyone ";
                                                    setInputValue(inputValueCopy);
                                                    setMentionSelectionPopperOpen(false);
                                                }}
                                            >
                                                <Typography variant={"h6"} sx={{ textTransform: "none" }}>
                                                    @everyone
                                                </Typography>
                                            </Button>
                                        </Card>
                                    </ListItem>
                                )}
                                {mentionSearchOptions.sort((a, b) => {
                                    // sort by user_name
                                    return a.user_name.toLowerCase().localeCompare(b.user_name.toLowerCase());
                                }).map((option, index) => (
                                    <ListItem
                                        ref={(el) => listItemRefs.current.set(option._id, el)}
                                        style={{
                                            paddingBottom: '10px',
                                            paddingLeft: '10px',
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                        }}
                                    >
                                        <Card sx={{
                                            display: 'flex',
                                            textAlign: "left",
                                            width: "99%",
                                            height: 50,
                                            border: 1,
                                            borderColor: theme.palette.secondary.main + "75",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                            backgroundImage: "none",
                                            cursor: 'pointer',
                                            backgroundColor: mentionOptionIndex === index + (renderEverythingOption ? 1 : 0) ? theme.palette.secondary.main + "25" : 'transparent',
                                            '&:hover': {
                                                backgroundColor: theme.palette.secondary.main + "25",
                                            }
                                        }}>
                                            <Button
                                                sx={{ width: "100%" }}
                                                onClick={async () => {
                                                    // merge the username into the input value
                                                    let inputValueCopy = inputValue;

                                                    // find the last @
                                                    let lastAt = inputValueCopy.lastIndexOf("@");
                                                    if (lastAt === -1) {
                                                        return;
                                                    }

                                                    // replace all of the text after the last @ with the username
                                                    inputValueCopy = inputValueCopy.substring(0, lastAt + 1) + "<" + option.user_name + "> ";
                                                    setInputValue(inputValueCopy);
                                                    setMentionSelectionPopperOpen(false);
                                                }}
                                            >
                                                <div
                                                    style={{ display: "flex", flexDirection: "row", width: "95%", justifyContent: "left" }}>
                                                    <div style={{ marginTop: "2px" }}>
                                                        <UserIcon
                                                            userId={option._id}
                                                            userTier={option.user_rank}
                                                            userThumb={config.rootPath + option.pfp_path}
                                                            backgroundName={option.name}
                                                            backgroundPalette={option.color_palette}
                                                            backgroundRender={option.render_in_front}
                                                            pro={option.user_status.toString() === "1"}
                                                            size={30}
                                                            imageTop={2}
                                                            profileButton={false}

                                                        />
                                                    </div>
                                                    <Typography variant="h5" component="div" sx={{
                                                        ml: 1,
                                                        marginTop: "2px",
                                                        mr: 2,
                                                        fontSize: 16,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}>
                                                        {option.user_name}
                                                    </Typography>
                                                </div>
                                                <Tooltip
                                                    title={`Renown ${
                                                        //@ts-ignore
                                                        option.tier + 1}`}
                                                >
                                                    <img
                                                        style={{
                                                            height: "99%",
                                                            width: "auto",
                                                            opacity: "0.85",
                                                            overflow: "hidden",
                                                        }}
                                                        src={handleRenownCheck(
                                                            //@ts-ignore
                                                            option.tier)}
                                                    />
                                                </Tooltip>
                                            </Button>
                                        </Card>
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </Box>
                </Popper>
            </>
        )
    }, [inputValue, showEmojiPicker, showGifPicker, mentionSearchOptions, mentionSelectionPopperOpen, mentionOptionIndex]);

    const chatMessageMemo = React.useMemo(() => {
        return messages.map((message) => (
            <ChatMessage
                _id={message._id}
                sender={false}
                username={message.author}
                content={message.message}
                date={new Date(message.created_at)}
                key={"chat-" + message._id + "-" + randomTag()}
                userRenown={message.author_renown}
                listRef={listContainerRef}
                releaseMem={true}
            />
        ));
    }, [messages]);

    const renderChatView = () => {
        // determine the appropriate bottom margin
        let marginBottom = '0px'
        if (loggedIn) {
            marginBottom = '88px'
        }
        if (window.innerWidth <= 1000) {
            marginBottom = '130px'
        }

        return (
            <>
                <List style={{ flexGrow: 1, marginTop: '70px', marginBottom: marginBottom }}>
                    {/* Show a spinner (MoonLoader from react-spinners) when we are loading new data */}
                    {loadingMessages && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <MoonLoader color={theme.palette.primary.main} loading={true} size={18} />
                        </div>
                    )}
                    {chatMessageMemo}
                </List>
                {showJumpToBottom && (
                    <Tooltip title="Jump to Bottom" placement="left">
                        <IconButton
                            onClick={scrollToBottom}
                            style={{
                                position: 'fixed',
                                bottom: window.innerWidth > 1000 ? '108px' : '172px',
                                right: '20px',
                                backgroundColor: theme.palette.background.default, // Match the background color
                                color: theme.palette.text.primary, // Match the text color
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' // Add a subtle shadow
                            }}
                        >
                            <ArrowDownward />
                        </IconButton>
                    </Tooltip>
                )}
                {/* Conditional back button if we're on the friends tab to go back to the chat selection view */}
                {selectedTab === "Friends" && (
                    <Tooltip title="Back to Friend Chats" placement="left">
                        <IconButton
                            onClick={() => {
                                setPrivateChatView(false);
                            }}
                            style={{
                                position: 'fixed',
                                top: '120px',
                                right: '20px',
                                backgroundColor: theme.palette.background.default, // Match the background color
                                color: theme.palette.primary.main,
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' // Add a subtle shadow
                            }}
                        >
                            <ArrowForward />
                        </IconButton>
                    </Tooltip>
                )}
                {loggedIn && (
                    <Box
                        p={2}
                        sx={{
                            position: 'fixed',
                            bottom: '0px',
                            width: window.innerWidth < 1000 ? "100%" : undefined,
                            zIndex: 6000,
                            // @ts-ignore
                            backgroundColor: theme.palette.background.chat,
                        }}
                    >
                        {/* make the text field grow with multiline input */}
                        {messageInputMemo}
                        <>
                            <Emoji open={showEmojiPicker} closeCallback={() => setShowEmojiPicker(false)}
                                onEmojiSelect={addEmoji} />
                            <Tenor open={showGifPicker} closeCallback={() => setShowGifPicker(false)}
                                addGif={sendGif} />
                        </>
                    </Box>
                )}
            </>
        )
    }

    const handleChatSelection = (chat: models.Chat) => {
        let c = JSON.parse(JSON.stringify(chat));
        setChat(c);
        setBootstrapped(false);
        setPrivateChatView(true);
        // update the inputValue for the cached value
        setInputValue(messageCache[chat._id] !== undefined && messageCache[chat._id].message !== undefined ? messageCache[chat._id].message as string : "")
    }

    const handleFriendSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setFriendNameQuery(value);

        if (autoCompleteRef.current) {
            autoCompleteRef.current.focus();
        }

        if (authorRole === 1) {
            await searchUsersPublic(value);
        } else {
            await searchFriends(value);
        }

        if (autoCompleteRef.current) {
            autoCompleteRef.current.focus();
        }
    };

    const handleChatButtonClick = (chat: models.Chat) => {
        if (chatClickTimeout) {
            clearTimeout(chatClickTimeout);
            setChatClickTimeout(null);
            // Handle double click
            setNewChatName(chat.name);
            setEditingChatName(chat._id);
        } else {
            const timeout = setTimeout(() => {
                // Handle single click
                handleChatSelection(chat);
                setChatClickTimeout(null);
            }, 300);  // 300ms to wait for the second click
            setChatClickTimeout(timeout);
        }
    }

    const updateChatName = async (chat: models.Chat) => {
        setEditingChatName(null);
        let name = newChatName;
        setNewChatName("");

        // update the chat name
        let c = JSON.parse(JSON.stringify(chats));
        let index = c.findIndex((e: models.Chat) => e._id === chat._id);
        let oldChatName = "";
        if (index !== -1) {
            oldChatName = c[index].name;
            c[index].name = name;
            setChats(c);
        }

        let wsMsg: wsModels.WsMessage<any> = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: wsModels.WsMessageType.UpdateChat,
            payload: {
                chat_id: chat._id,
                name: name,
                add_users: [],
                remove_users: [],
            }
        }
        globalWs.sendWebsocketMessage(wsMsg, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.UpdateChat) {
                return;
            }

            // handle error case
            swal("Server Error", "The server didn't update your chat. It didn't like your name but we think it's great!");

            // revert the chat name
            let c = JSON.parse(JSON.stringify(chats));
            let index = c.findIndex((e: models.Chat) => e._id === chat._id);
            if (index !== -1) {
                c[index].name = oldChatName;
                setChats(c);
            }
        })
    }

    const createChat = async () => {
        if (newChatSelectedFriends.length === 0) {
            return;
        }

        setLoadingNewChat(true);

        // select chat type depending on if there is more than one user
        let chatType = models.ChatType.ChatTypeDirectMessage;
        if (newChatSelectedFriends.length > 1) {
            chatType = models.ChatType.ChatTypePrivateGroup;
        }

        // if the chat type is a dm check to make sure a dm with that user doesn't already exist
        if (chatType === models.ChatType.ChatTypeDirectMessage) {
            let existingChat = chats.find((e: models.Chat) =>
                e.type === models.ChatType.ChatTypeDirectMessage &&
                e.users.length === 2 && e.users.includes(newChatSelectedFriends[0]._id
                ));
            if (existingChat !== undefined) {
                handleChatSelection(existingChat);
                setLoadingNewChat(false);
                handleNewChatClose();
                return;
            }
        }

        // create the chat name using the first initial of each user's username
        let chatName = newChatSelectedFriends[0].user_name;
        if (newChatSelectedFriends.length > 1) {
            chatName = "";
            for (let i = 0; i < newChatSelectedFriends.length; i++) {
                // exit if we can't add 3 characters and stay under 20 characters
                if (chatName.length + 3 > 20) {
                    break;
                }

                chatName += newChatSelectedFriends[i].user_name[0].toUpperCase();
                if (i !== newChatSelectedFriends.length - 1) {
                    chatName += ", ";
                }
            }
        }

        // create the chat
        let wsMsg: wsModels.WsMessage<any> = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: wsModels.WsMessageType.NewChat,
            payload: {
                name: chatName,
                chat_type: chatType,
                // map selected friends into an array of user ids
                users: newChatSelectedFriends.map((friend) => friend._id),
            }
        }
        globalWs.sendWebsocketMessage(wsMsg, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.NewChat) {
                let c = msg.payload as models.Chat;
                // skip if we already have the chat
                if (chats.findIndex((e: models.Chat) => e._id === c._id) !== -1) {
                    return;
                }
                let z = JSON.parse(JSON.stringify(chats));
                z.push(c);
                setChats(z);
                handleChatSelection(c);
                setLoadingNewChat(false);
                handleNewChatClose();
                return;
            }

            setLoadingNewChat(false);
            handleNewChatClose();

            // handle error case
            swal("Server Error", "The server didn't make your chat. It's having a mood. We'll talk to it...");
        })
    };

    const friendSearchMemo = React.useMemo(() => (
        <Search
            sx={{
                width: '500px',
                mt: 1,
                mb: 2,
                marginLeft: 'auto',
                paddingRight: '10px',
                marginRight: '24px',
            }}
        >
            <SearchIconWrapper>
                <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={(e) => handleFriendSearchInputChange(e as any)}>
                <StyledInputBase
                    ref={autoCompleteRef}
                    sx={{
                        width: '324px',
                    }}
                    onClick={(e) => (authorRole === 1) ? searchUsersPublic(friendNameQuery) : searchFriends(friendNameQuery)}
                    onChange={(e) => handleFriendSearchInputChange(e as any)}
                    defaultValue={friendNameQuery}
                    placeholder="Search your Friends!"
                />
            </form>
        </Search>
    ), []);

    const deleteChat = async () => {
        if (chatEdit === null) {
            return;
        }

        setChatDeleteLoading(true);
        let wsMsg: wsModels.WsMessage<any> = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: wsModels.WsMessageType.DeleteChat,
            payload: {
                chat_id: chatEdit._id,
            }
        }
        globalWs.sendWebsocketMessage(wsMsg, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.DeleteChat) {
                // remove the chat from the list
                let c = JSON.parse(JSON.stringify(chats));
                let index = c.findIndex((e: models.Chat) => e._id === chatEdit._id);
                if (index !== -1) {
                    c.splice(index, 1);
                    setChats(c);
                }
                setChatDeleteLoading(false);
                handleChatSelectionRightClickClose();
                return;
            }

            setChatDeleteLoading(false);
            handleChatSelectionRightClickClose();

            // handle error case
            swal("Server Error", "The server didn't delete your chat. It's having a mood. We'll talk to it...");
        });
    }

    const muteChat = async () => {
        if (chatEdit === null) {
            return;
        }

        setChatMuteLoading(true);
        let wsMsg: wsModels.WsMessage<any> = {
            sequence_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            type: wsModels.WsMessageType.UpdateChatMute,
            payload: {
                chat_id: chatEdit._id,
                mute: !chatEdit.muted,
            }
        }
        globalWs.sendWebsocketMessage(wsMsg, (msg: wsModels.WsMessage<any>) => {
            if (msg.type === wsModels.WsMessageType.UpdateChatMute) {
                // mark chat as muted or unmuted
                let c = JSON.parse(JSON.stringify(chats));
                let index = c.findIndex((e: models.Chat) => e._id === chatEdit._id);
                if (index !== -1) {
                    c[index].muted = !chatEdit.muted;
                    setChats(c);
                }
                setChatMuteLoading(false);
                handleChatSelectionRightClickClose();
                return;
            }

            setChatMuteLoading(false);
            handleChatSelectionRightClickClose();

            // handle error case
            swal("Server Error", "The server didn't mute your chat. It's having a mood. We'll talk to it...");
        });
    }

    const renderPrivateChatSelectionView = () => {
        const formatChatDate = (date: Date) => {
            const now = new Date();

            // Within the last minute
            if (isWithinInterval(date, { start: subMinutes(now, 1), end: now })) {
                return 'now';
            }

            // Within the same day
            if (!isBefore(date, subHours(now, 24))) {
                const diffInHours = differenceInHours(now, date);
                if (diffInHours > 0) {
                    return `${diffInHours}h`;
                }
                return `${differenceInMinutes(now, date)}m`;
            }
            // Within the last week
            else if (isWithinInterval(date, { start: subDays(now, 7), end: now })) {
                return format(date, 'EEE');
            }
            // Within the last year
            else if (isWithinInterval(date, { start: subYears(now, 1), end: now })) {
                return format(date, 'MMM d');
            }
            // Older than a year
            else {
                return format(date, 'MM/dd/yy');
            }
        };

        const humanReadableDate = (date: Date) => {
            return format(date, 'MMMM do yyyy, h:mm a');
        };

        // Show a spinner (MoonLoader from react-spinners) when we are loading new data
        if (loadingChats) {
            return (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        marginTop: "64px"
                    }}
                >
                    <MoonLoader color={theme.palette.primary.main} loading={true} size={18} />
                </div>
            )
        }

        return (
            <>
                <Menu
                    anchorEl={chatSelectionRightClickAnchorEl}
                    open={Boolean(chatSelectionRightClickAnchorEl)}
                    onClose={handleChatSelectionRightClickClose}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            minWidth: 'unset',
                            padding: '0.5rem',
                        }
                    }}
                >
                    <Box display="flex" justifyContent="center">
                        {confirmingDelete ? (
                            <>
                                <Tooltip title="Confirm Delete">
                                    <LoadingButton
                                        variant={"text"}
                                        onClick={deleteChat}
                                        color={"success"}
                                        size="small"
                                        loading={chatDeleteLoading}
                                        sx={{ marginRight: '16px' }}
                                    >
                                        <Check fontSize="inherit" />
                                    </LoadingButton>
                                </Tooltip>
                                <Tooltip title="Cancel Delete">
                                    <LoadingButton
                                        variant={"text"}
                                        onClick={() => {
                                            setConfirmingDelete(false)
                                            handleChatSelectionRightClickClose();
                                        }}
                                        color={"error"}
                                        size="small"
                                        loading={chatDeleteLoading}
                                    >
                                        <Close fontSize="inherit" />
                                    </LoadingButton>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <Tooltip title="Delete Chat">
                                    <LoadingButton
                                        variant={"text"}
                                        onClick={() => setConfirmingDelete(true)}
                                        color={"error"}
                                        size="small"
                                        loading={chatDeleteLoading}
                                        sx={{ marginRight: '16px' }}
                                    >
                                        <Delete fontSize="inherit" />
                                    </LoadingButton>
                                </Tooltip>
                                {chatEdit && chatEdit.muted ? (
                                    <Tooltip title="Unmute Chat">
                                        <LoadingButton
                                            variant={"text"}
                                            onClick={muteChat}
                                            size="small"
                                            color={"primary"}
                                            loading={chatMuteLoading}
                                        >
                                            <VolumeUp fontSize="inherit" />
                                        </LoadingButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Mute Chat">
                                        <LoadingButton
                                            variant={"text"}
                                            onClick={muteChat}
                                            size="small"
                                            color={"primary"}
                                            loading={chatMuteLoading}
                                        >
                                            <VolumeOff fontSize="inherit" />
                                        </LoadingButton>
                                    </Tooltip>
                                )
                                }
                            </>
                        )}
                    </Box>
                </Menu>
                <List style={{ flexGrow: 1, marginTop: '40px' }}>
                    <ListItem>
                        <Button
                            variant="outlined"
                            endIcon={<AddIcon />}
                            onClick={(e) => {
                                handleNewChatClick(e);
                                searchFriends(friendNameQuery);
                            }}
                            sx={{
                                textTransform: 'none',
                                color: theme.palette.text.primary,
                                width: '100%',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main + "25",
                                },
                            }}
                        >
                            New Chat
                        </Button>
                        <Popover
                            id={newChatPopoverId}
                            open={newChatOpen}
                            anchorEl={newChatnchorEl}
                            onClose={handleNewChatClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <Box
                                sx={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 1,
                                    // @ts-ignore
                                    backgroundColor: theme.palette.background.paper,
                                    padding: theme.spacing(1),
                                }}
                            >
                                {friendSearchMemo}
                                <Grid container spacing={1}
                                    sx={{
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        maxWidth: "320px",
                                    }}
                                >
                                    {newChatSelectedFriends.map((friend) => {
                                        return (
                                            <Grid item xs={3}>
                                                <Tooltip title={friend.user_name + " - Click to Remove"}>
                                                    <Button variant="text"
                                                        onClick={() => {
                                                            let z = JSON.parse(JSON.stringify(newChatSelectedFriends));
                                                            let index = z.findIndex((e: User) => e._id === friend._id);
                                                            if (index !== -1) {
                                                                z.splice(index, 1);
                                                                setNewChatSelectedFriends(z);
                                                            }
                                                        }}
                                                    >
                                                        <UserIcon
                                                            userId={friend._id}
                                                            userTier={friend.user_rank}
                                                            userThumb={config.rootPath + friend.pfp_path}
                                                            backgroundName={friend.name}
                                                            backgroundPalette={friend.color_palette}
                                                            backgroundRender={friend.render_in_front}
                                                            pro={friend.user_status.toString() === "1"}
                                                            size={20}
                                                            imageTop={2}
                                                            profileButton={false}
                                                        />
                                                    </Button>
                                                </Tooltip>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                                <Card
                                    sx={{
                                        backgroundColor: 'transparent',
                                        backgroundImage: 'none',
                                        boxShadow: 'none',
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        mt: 2,
                                        mb: 2,
                                    }}
                                >
                                    <List>
                                        {friendSearchOptions.filter((u) => {
                                            // ensure any selected user is not in the list
                                            return !newChatSelectedFriends.some((e) => e._id === u._id);
                                        }).sort((a, b) => {
                                            // sort by user_name
                                            return a.user_name.toLowerCase().localeCompare(b.user_name.toLowerCase());
                                        }).map((option) => (
                                            <ListItem
                                                style={{
                                                    paddingBottom: '10px',
                                                    paddingLeft: '10px',
                                                    marginLeft: "auto",
                                                    marginRight: "auto",
                                                }}
                                            >
                                                <Card sx={{
                                                    display: 'flex',
                                                    textAlign: "left",
                                                    width: "99%",
                                                    height: 75,
                                                    border: 1,
                                                    borderColor: theme.palette.secondary.main + "75",
                                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1);",
                                                    backgroundColor: "transparent",
                                                    backgroundImage: "none",
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.secondary.main + "25",
                                                    }
                                                }}>
                                                    <Button
                                                        sx={{ width: "100%" }}
                                                        onClick={async () => {
                                                            let z = JSON.parse(JSON.stringify(newChatSelectedFriends));
                                                            z.push(option);
                                                            setNewChatSelectedFriends(z);
                                                        }}
                                                    >
                                                        <div
                                                            style={{ display: "flex", flexDirection: "row", width: "95%", justifyContent: "left" }}>
                                                            <div>
                                                                <UserIcon
                                                                    userId={option._id}
                                                                    userTier={option.user_rank}
                                                                    userThumb={config.rootPath + option.pfp_path}
                                                                    backgroundName={option.name}
                                                                    backgroundPalette={option.color_palette}
                                                                    backgroundRender={option.render_in_front}
                                                                    pro={option.user_status.toString() === "1"}
                                                                    size={50}
                                                                    imageTop={2}
                                                                    profileButton={false}

                                                                />
                                                            </div>
                                                            <Typography variant="h5" component="div" sx={{
                                                                ml: 1,
                                                                mt: 1,
                                                                fontSize: 16,
                                                            }}>
                                                                {
                                                                    //@ts-ignore
                                                                    option.user_name}
                                                            </Typography>
                                                        </div>
                                                        <Tooltip
                                                            title={`Renown ${
                                                                //@ts-ignore
                                                                option.tier + 1}`}
                                                        >
                                                            <img
                                                                style={{
                                                                    height: "99%",
                                                                    width: "auto",
                                                                    opacity: "0.85",
                                                                    overflow: "hidden",
                                                                }}
                                                                src={handleRenownCheck(
                                                                    //@ts-ignore
                                                                    option.tier)}
                                                            />
                                                        </Tooltip>
                                                    </Button>
                                                </Card>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Card>
                                <LoadingButton
                                    loading={loadingNewChat}
                                    variant="outlined"
                                    disabled={newChatSelectedFriends.length === 0}
                                    onClick={createChat}
                                    sx={{
                                        width: "355px",
                                        mt: 1,
                                        marginLeft: "10px",
                                        marginRight: "auto",
                                    }}
                                >
                                    Create Chat
                                </LoadingButton>
                            </Box>
                        </Popover>
                    </ListItem>
                    {chats.sort((a, b) => {
                        // if chats have null last message times then sort them to the top
                        if (a.last_message_time === null && b.last_message_time === null) {
                            return 0;
                        }
                        if (a.last_message_time === null) {
                            return -1;
                        }
                        if (b.last_message_time === null) {
                            return 1;
                        }

                        // sort chats by last message time in descending order
                        // we need to convert them to dates to preserve the proper tz info
                        let aDate = new Date(a.last_message_time);
                        let bDate = new Date(b.last_message_time);
                        if (aDate > bDate) {
                            return -1;
                        }
                        if (aDate < bDate) {
                            return 1;
                        }
                        return 0;
                    }).map((chat) => {
                        let ItemElem: any = ListItemButton;
                        if (chat._id === editingChatName) {
                            ItemElem = ListItem;
                        }

                        let iconData = chat.name[0];
                        if (chat.type === models.ChatType.ChatTypePrivateGroup) {
                            let parts = chat.user_names
                                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
                            if (parts.length > 3) {
                                parts = parts.slice(0, 3);
                            }
                            iconData = parts
                                .map((part) => part.charAt(0).toUpperCase())
                                .join('');
                        }

                        let chatName = chat.name;
                        if (chat.type === models.ChatType.ChatTypeDirectMessage) {
                            // for dms we want to show the other user's name
                            let otherUser = chat.user_names[chat.users[0] === authorId ? 1 : 0];
                            if (otherUser) {
                                chatName = otherUser;
                            }
                        }

                        return (
                            <ItemElem
                                key={chat._id}
                                onContextMenu={handleChatSelectionRightClick.bind(null, chat)}
                                onClick={() => {
                                    if (editingChatName === chat._id) {
                                        return;
                                    }
                                    handleChatButtonClick(chat);
                                }}
                                sx={{
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    '&:hover': {
                                        backgroundColor: editingChatName ? 'transparent' : theme.palette.primary.main + "25",
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    {chat.type === models.ChatType.ChatTypeDirectMessage && chat.icon ? (
                                        <UserIcon
                                            userId={chat.users[0] === authorId ? chat.users[1] : chat.users[0]}
                                            userTier={0}
                                            userThumb={config.rootPath + chat.icon?.icon}
                                            backgroundName={chat.icon?.background}
                                            backgroundPalette={chat.icon?.background_palette}
                                            backgroundRender={chat.icon?.background_render_in_front}
                                            pro={chat.icon?.pro}
                                            size={30}
                                            imageTop={2}
                                            profileButton={false}
                                        />
                                    ) : (
                                        <Avatar>{iconData}</Avatar>
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        editingChatName === chat._id ? (
                                            <TextField
                                                ref={chatNameEditRef}
                                                defaultValue={chat.name}
                                                onBlur={(e) => updateChatName(chat)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        updateChatName(chat);
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => setNewChatName(e.target.value)}
                                                value={newChatName}
                                                sx={{
                                                    width: '160px',
                                                    height: '10px',
                                                    '& .MuiFormHelperText-root': {
                                                        fontSize: '8px',
                                                    }
                                                }}
                                                inputProps={{
                                                    maxLength: 20,
                                                }}
                                                error={newChatName.length > 20}
                                                helperText={newChatName.length > 15 ? `${newChatName.length}/20` : ""}
                                                InputProps={{
                                                    style: { fontSize: '12px', height: '30px' },
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: '160px',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                {chatName}
                                            </div>
                                        )
                                    }
                                />
                                {chat.muted ? (
                                    <Grid
                                        container
                                        direction="column"
                                        alignItems="center"
                                        xs="auto"
                                        sx={{
                                            marginRight: '10px',
                                        }}
                                    >
                                        {/* Muted Icon */}
                                        <Grid item xs="auto">
                                            <Tooltip title="Muted">
                                                <VolumeOff
                                                    sx={{
                                                        marginTop: '10px',
                                                        color: theme.palette.secondary.main,
                                                        fontSize: '12px',
                                                    }}
                                                />
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <></>
                                )}

                                {/* Date Tooltip and Unread Icon */}
                                <Grid
                                    container
                                    direction="column"
                                    justifyContent="center"
                                    alignItems={
                                        chat.last_read_message === null ||
                                            chat.last_message === null ||
                                            compareMessageIDs(chat.last_read_message, chat.last_message) < 0 ?
                                            "flex-end" :
                                            "center"
                                    }
                                    xs="auto"
                                >
                                    {/* Date Tooltip */}
                                    <Grid item xs="auto">
                                        <Tooltip
                                            title={chat.last_message_time ? humanReadableDate(new Date(chat.last_message_time)) : ''}>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                                                {chat.last_message_time ? formatChatDate(new Date(chat.last_message_time)) : ''}
                                            </Typography>
                                        </Tooltip>
                                    </Grid>

                                    {/* Unread Icon */}
                                    <Grid item xs="auto">
                                        {chat.last_read_message === null || chat.last_message === null || compareMessageIDs(chat.last_read_message, chat.last_message) < 0 ? (
                                            <FiberManualRecordIcon
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '12px',
                                                }}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </Grid>
                                </Grid>

                            </ItemElem>
                        )
                    })}
                </List>
            </>
        );
    };

    const renderView = () => {
        if (selectedTab === "Friends" && !privateChatView) {
            return renderPrivateChatSelectionView();
        }
        return renderChatView();
    }

    const closeNotification = () => {
        setNotification(null);
    };

    const renderMessageNotificationContent = () => {
        if (notification === null || notification.msg === null || notification.chat === null) {
            return;
        }

        let chat = notification.chat;
        let msg = notification.msg;

        let iconData = chat.name[0];
        if (chat.type === models.ChatType.ChatTypePrivateGroup) {
            let parts = chat.user_names
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            if (parts.length > 3) {
                parts = parts.slice(0, 3);
            }
            iconData = parts
                .map((part) => part.charAt(0).toUpperCase())
                .join('');
        }

        let chatName = chat.name;
        if (chat.type === models.ChatType.ChatTypeDirectMessage) {
            // for dms we want to show the other user's name
            let otherUser = chat.user_names[chat.users[0] === authorId ? 1 : 0];
            if (otherUser) {
                chatName = "DM With " + otherUser;
            }
        }

        // detect if we have been mentioned by checking for our username in the message prefaced by an @
        let notificationMessage = msg.author + " Messaged"
        if (msg.message.toLowerCase().includes("@" + authorName.toLowerCase()) ||
            msg.message.toLowerCase().includes("@everyone")) {
            notificationMessage = msg.author + " Mentioned You"
        }

        return (
            <ListItem
                key={chat._id}
                onClick={() => {
                    closeNotification();
                    let appWrapperState = Object.assign({}, initialAppWrapperStateUpdate);
                    appWrapperState.chatOpen = true;
                    dispatch(updateAppWrapper(appWrapperState));
                    handleChatButtonClick(chat);
                }}
                sx={{
                    height: '64px',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    ...themeHelpers.frostedGlass,
                    backgroundColor: "rgba(206,206,206,0.31)",
                }}
            >
                <ListItemIcon>
                    {chat.type === models.ChatType.ChatTypeDirectMessage && chat.icon ? (
                        <UserIcon
                            userId={chat.users[0] === authorId ? chat.users[1] : chat.users[0]}
                            userTier={0}
                            userThumb={config.rootPath + chat.icon?.icon}
                            backgroundName={chat.icon?.background}
                            backgroundPalette={chat.icon?.background_palette}
                            backgroundRender={chat.icon?.background_render_in_front}
                            pro={chat.icon?.pro}
                            size={30}
                            imageTop={2}
                            profileButton={false}
                        />
                    ) : (
                        <Avatar>{iconData}</Avatar>
                    )}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <div
                            style={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                fontSize: '14px',
                            }}
                        >
                            {notificationMessage}
                        </div>
                    }
                    secondary={
                        <div
                            style={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                fontSize: '12px',
                            }}
                        >
                            {chatName}
                        </div>
                    }
                />
            </ListItem>
        )
    }

    const renderUpdateNotificationContent = () => {
        if (notification === null || notification.event === null) {
            return;
        }

        let chat = notification.event.chat;

        let chatName = chat.name;
        if (chat.type === models.ChatType.ChatTypeDirectMessage) {
            // for dms we want to show the other user's name
            let otherUser = chat.user_names[chat.users[0] === authorId ? 1 : 0];
            if (otherUser) {
                chatName = "DM With " + otherUser;
            }
        }

        let message = "";
        for (let i = 0; i < notification.event.update_events.length; i++) {
            // if the event is a delete it takes precedence over all other events
            if (notification.event.update_events[i] === models.ChatUpdateEvent.ChatUpdateEventDeleted) {
                message = "Deleted " + chatName;
                break;
            }

            // handle name change
            if (notification.event.update_events[i] === models.ChatUpdateEvent.ChatUpdateEventNameChange &&
                chat.type !== models.ChatType.ChatTypeDirectMessage) {
                // get the old name of the chat
                message = "Changed " + notification.event.old_name + "'s Name to " + chatName;
            }

            // handle user addition
            if (notification.event.update_events[i] === models.ChatUpdateEvent.ChatUpdateEventUserAdd &&
                notification.event.added_users !== null) {
                // check if we are one of the users added
                if (notification.event.added_users.findIndex((e) => e === authorId) !== -1) {
                    message = "Added You To " + chatName;
                    break;
                }

                // report how many users were added
                message = "Added " + notification.event.added_users.length + " Users To " + chatName;
            }

            // handle user removal
            if (notification.event.update_events[i] === models.ChatUpdateEvent.ChatUpdateEventUserRemove &&
                notification.event.removed_users !== null) {
                // check if we are one of the users removed
                if (notification.event.removed_users.findIndex((e) => e === authorId) !== -1) {
                    message = "Removed You From " + chatName;
                    break;
                }

                // report how many users were removed
                message = "Removed " + notification.event.removed_users.length + " Users From " + chatName;
            }
        }

        // abort if we didn't find a message
        if (message === "") {
            return;
        }

        // add the updater's name to the message
        message = notification.event.updater + " " + message;

        return (
            <ListItem
                key={chat._id}
                onClick={() => {
                    closeNotification();

                    if (notification === null || notification.event === null) {
                        return;
                    }

                    // skip loading the chat if this is a delete event
                    if (notification.event.update_events.findIndex((e) => e === models.ChatUpdateEvent.ChatUpdateEventDeleted) !== -1) {
                        return;
                    }

                    let appWrapperState = Object.assign({}, initialAppWrapperStateUpdate);
                    appWrapperState.chatOpen = true;
                    dispatch(updateAppWrapper(appWrapperState));
                    handleChatButtonClick(chat);
                }}
                sx={{
                    height: '64px',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    ...themeHelpers.frostedGlass,
                    backgroundColor: "rgba(206,206,206,0.31)",
                }}
            >
                <ListItemIcon>
                    <UserIcon
                        userId={notification.event.updater}
                        userTier={0}
                        userThumb={config.rootPath + notification.event.updater_icon}
                        backgroundName={notification.event.updater_background}
                        backgroundPalette={notification.event.updater_background_palette}
                        backgroundRender={notification.event.updater_background_render_in_front}
                        pro={notification.event.updater_pro}
                        size={30}
                        imageTop={2}
                        profileButton={false}
                    />
                </ListItemIcon>
                <ListItemText
                    primary={
                        <div
                            style={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                fontSize: '14px',
                            }}
                        >
                            {message}
                        </div>
                    }
                />
            </ListItem>
        )
    }

    const renderNotificationContent = () => {
        if (notification === null) {
            return;
        }

        if (notification.event !== null) {
            return renderUpdateNotificationContent();
        }

        return renderMessageNotificationContent();
    }

    return (
        <>
            {ReactDOM.createPortal(
                (
                    <Snackbar
                        open={notification !== null}
                        onClose={closeNotification}
                        autoHideDuration={3000}
                        key={"chat-notification"}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        style={{
                            position: "fixed",
                            width: window.innerWidth > 1000 ? "fit-content" : undefined,
                            top: '80px',
                            right: window.innerWidth < 1000 ? undefined : chatOpen ? '340px' : '40px'
                        }}
                    >
                        {renderNotificationContent()}
                    </Snackbar>
                ),
                document.body
            )}
            {chatOpen && (
                <Paper
                    elevation={3}
                    style={{
                        height: window.innerWidth > 1000 ? "100vh" : (window.innerHeight > 600 ? "89vh" : "80vh"),
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '0px',
                        // @ts-ignore
                        backgroundColor: theme.palette.background.chat,
                        // Note: I'm saving this here since it helped at one point but it no longer seems to be necessary
                        // This locks teh ability for the user to scroll up when we are loading data or processing a observer mutation
                        // overflowY: loadingMessages || activeMutation ? 'hidden' : 'auto', // Conditionally set overflow based on fetchingData
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                    onScroll={handleScroll}
                    ref={listContainerRef}
                >
                    {renderTopBar()}
                    {renderView()}
                    <div ref={containerEndRef} />
                </Paper>
            )}
        </>
    );
}
