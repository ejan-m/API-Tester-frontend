// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://127.0.0.1:5000';

    constructor(private http: HttpClient) { }

    runTests(apis: any[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/run-tests`, { apis });
    }

    saveScenario(scenario: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/save-scenario`, scenario);
    }
}
