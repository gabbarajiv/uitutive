import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PublicForm {
    id: string;
    title: string;
    description?: string;
    fields: any[];
    isPublic: boolean;
    shareableLink: string;
    created_at: Date;
    updated_at: Date;
}

export interface PublicSubmissionResponse {
    id: string;
    message: string;
    timestamp: Date;
}

export interface PublicFormResponse {
    success: boolean;
    data: PublicForm;
    error?: string;
}

export interface PublicSubmissionResponseData {
    success: boolean;
    data: PublicSubmissionResponse;
    error?: string;
    missingFields?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class PublicFormService {
    private apiUrl = `${environment.apiUrl}/public`;

    constructor(private http: HttpClient) { }

    /**
     * Get a public form by shareable link
     */
    getFormByLink(link: string): Observable<PublicFormResponse> {
        return this.http.get<PublicFormResponse>(`${this.apiUrl}/forms/${link}`);
    }

    /**
     * Submit a public form
     */
    submitForm(link: string, data: Record<string, any>): Observable<PublicSubmissionResponseData> {
        return this.http.post<PublicSubmissionResponseData>(
            `${this.apiUrl}/forms/${link}/submit`,
            { data }
        );
    }
}
