import { Component } from '@angular/core';
import { ApiService } from '../api.service';

interface ApiParam {
    key: string;
    value: string;
}

interface ApiHeader {
    key: string;
    value: string;
}

interface ChainParam {
    path: string;
    sourcePath: string;
}

interface Api {
    method: string;
    url: string;
    params: ApiParam[];
    headers: ApiHeader[];
    jsonBody: string;
    xmlBody: string;
    chainParams: ChainParam[];
}

interface ApiResponse {
    body: any;
    status_code: number;
    content_type: string;
}

@Component({
    selector: 'app-api-integration',
    templateUrl: './api-integration.component.html',
    styleUrls: ['./api-integration.component.css']
})
export class ApiIntegrationComponent {
    apis: Api[] = [
        { method: 'GET', url: '', params: [], headers: [], jsonBody: '', xmlBody: '', chainParams: [] }
    ];
    responses: ApiResponse[] = [];

    constructor(private apiService: ApiService) { }

    addApi() {
        this.apis.push({ method: 'GET', url: '', params: [], headers: [], jsonBody: '', xmlBody: '', chainParams: [] });
    }

    removeApi(index: number) {
        this.apis.splice(index, 1);
    }

    runTests() {
        const results: ApiResponse[] = [];
        const executeApi = (index: number) => {
            if (index >= this.apis.length) {
                this.responses = results;
                return;
            }
            const api = this.apis[index];
            // Replace chain parameters with actual values from the previous API response
            if (index > 0) {
                const previousApiResponse: ApiResponse = results[index - 1];
                api.chainParams.forEach((chainParam: ChainParam) => {
                    let value: any;
                    if (previousApiResponse.content_type.includes('application/json')) {
                        value = this.getValueByPath(previousApiResponse.body, chainParam.sourcePath);
                    } else {
                        // For simplicity, let's not handle XML path replacement in this example
                    }
                    if (value) {
                        if (api.jsonBody) {
                            api.jsonBody = this.setValueByPath(api.jsonBody, chainParam.path, value);
                        } else if (api.xmlBody) {
                            // For simplicity, let's not handle XML path replacement in this example
                        }
                    }
                });
            }
            const formattedApi: any = {
                ...api,
                body: api.method === 'POST' || api.method === 'PUT' ? api.jsonBody : ''
            };
            this.apiService.runTests([formattedApi]).subscribe((data: { responses: ApiResponse[] }) => {
                results.push(data.responses[0]);
                executeApi(index + 1);
            });
        };
        executeApi(0);
    }

    // Function to get value by path in a JSON object
    getValueByPath(obj: any, path: string): any {
        try {
            return path.split('.').reduce((acc, part) => {
                const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
                if (arrayMatch) {
                    return acc[arrayMatch[1]][parseInt(arrayMatch[2], 10)];
                }
                return acc[part];
            }, obj);
        } catch (e) {
            return null;
        }
    }

    // Function to set value by path in a JSON object
    setValueByPath(json: string, path: string, value: any): string {
        try {
            const obj = JSON.parse(json);
            const parts = path.split('.');
            let current = obj;
            for (let i = 0; i < parts.length - 1; i++) {
                const arrayMatch = parts[i].match(/^(\w+)\[(\d+)\]$/);
                if (arrayMatch) {
                    const arrayIndex = parseInt(arrayMatch[2], 10);
                    if (!current[arrayMatch[1]]) current[arrayMatch[1]] = [];
                    if (!current[arrayMatch[1]][arrayIndex]) current[arrayMatch[1]][arrayIndex] = {};
                    current = current[arrayMatch[1]][arrayIndex];
                } else {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
            }
            const lastPart = parts[parts.length - 1];
            const lastArrayMatch = lastPart.match(/^(\w+)\[(\d+)\]$/);
            if (lastArrayMatch) {
                current[lastArrayMatch[1]][parseInt(lastArrayMatch[2], 10)] = value;
            } else {
                current[lastPart] = value;
            }
            return JSON.stringify(obj);
        } catch (e) {
            return json;
        }
    }
}
