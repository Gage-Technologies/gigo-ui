export default interface Post {
    _id: string;
    title: string;
    description: string;
    author: string;
    author_id: string;
    tags: string[];
    created_at: Date;
    updated_at: Date;
    repo_id: string;
    tier: number;
    tier_string: string;
    awards: string[];
    top_reply: string | null;
    coffee: number;
    post_type: number;
    post_type_string: string;
    views: number;
    completions: number;
    attempts: number;
    languages: number[];
    languages_strings: string[];
    published: boolean;
    visibility: number;
    visibility_string: string;
    thumbnail: string;
    leads: boolean;
}

export interface ProjectTutorial {
    number: number;
    content: string;
}