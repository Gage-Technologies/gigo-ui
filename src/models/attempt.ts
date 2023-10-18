export default interface Attempt {
    _id: string;
    post_title: string;
    description: string;
    author: string;
    author_id: string;
    created_at: Date;
    updated_at: Date;
    repo_id: string;
    author_tier: number;
    awards: string[];
    coffee: string;
    post_id: string;
    closed: boolean;
    success: boolean;
    closed_date: Date | null;
    tier: number;
    parent_attempt: string | null;
    thumbnail: string;
    post_type: number;
    post_type_string: string;
}