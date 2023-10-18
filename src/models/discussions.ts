import Notification from "./notification";

export interface Discussion {
    _id: string;
    body: string;
    author: string;
    author_id: string;
    created_at: Date | null;
    updated_at: Date | null;
    author_tier: number;
    awards: string[] | null;
    coffee: number;
    post_id: string;
    title: string;
    tags: string[] | null;
    leads: boolean;
    revision: number;
    discussion_level: number;
}

export interface Comment {
    _id: string;
    body: string;
    author: string;
    author_id: string;
    created_at: Date | null;
    author_tier: number;
    awards: string[] | null;
    coffee: number;
    discussion_id: string;
    leads: boolean;
    revision: number;
    discussion_level: number;
}

export interface ThreadComment {
    _id: string;
    body: string;
    author: string;
    author_id: string;
    created_at: Date | null;
    author_tier: number;
    coffee: number;
    comment_id: string;
    leads: boolean;
    revision: number;
    discussion_level: number;
}

export interface ThreadReply {
    _id: string;
    body: string;
    author: string;
    author_id: string;
    created_at: Date | null;
    author_tier: number;
    coffee: number;
    thread_comment_id: string;
    revision: number;
    discussion_level: number;
}

export const EmptyDiscussion = {
    _id: "",
    body: "",
    author: "",
    author_id: "",
    created_at: null,
    updated_at: null,
    author_tier: 0,
    awards: null,
    coffee: 0,
    post_id: "",
    title: "",
    tags: null,
    leads: false,
    revision: 0,
    discussion_level: 0
} as Discussion;

export const EmptyComment = {
    _id: "",
    body: "",
    author: "",
    author_id: "",
    created_at: null,
    author_tier: 0,
    awards: null,
    coffee: 0,
    discussion_id: "",
    leads: false,
    revision: 0,
    discussion_level: 1
} as Comment;

export const EmptyThreadComment = {
    _id: "",
    body: "",
    author: "",
    author_id: "",
    created_at: null,
    author_tier: 0,
    awards: null,
    coffee: 0,
    comment_id: "",
    leads: false,
    revision: 0,
    discussion_level: 2
} as ThreadComment;

export const EmptyThreadReply = {
    _id: "",
    body: "",
    author: "",
    author_id: "",
    created_at: null,
    author_tier: 0,
    awards: null,
    coffee: 0,
    thread_comment_id: "",
    revision: 0,
    discussion_level: 3
} as ThreadReply;