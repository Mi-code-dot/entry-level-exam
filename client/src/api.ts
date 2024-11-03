import axios from 'axios';
import { APIRootPath } from '@fed-exam/config';

export type Ticket = {
    id: string,
    title: string;
    content: string;
    creationTime: number;
    userEmail: string;
    labels?: string[];
    isPinned?: boolean;
    isExpanded?: boolean;
}

export type ApiClient = {
    getTickets: (params: { query: string; after?: string; before?: string; from?: string }) => Promise<Ticket[]>;
}

export const createApiClient = (): ApiClient => {
    return {
        getTickets: (params: { query: string; after?: string; before?: string; from?: string }) => {
            const queryString = new URLSearchParams({
                search: params.query || '',
                after: params.after || '',
                before: params.before || '',
                from: params.from || ''
            }).toString();
            return axios.get(`${APIRootPath}?${queryString}`).then((res) => res.data);
        }
    }
}