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
    name: string;
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
    name: string;
}

@Component({
    selector: 'app-api-integration',
    templateUrl: './api-integration.component.html',
    styleUrls: ['./api-integration.component.css']
})
export class ApiIntegrationComponent {
    scenarioName: string = '';
    apis: Api[] = [
        { name: '', method: 'GET', url: '', params: [], headers: [], jsonBody: '', xmlBody: '', chainParams: [] }
    ];
    responses: ApiResponse[] = [];

    constructor(private apiService: ApiService) { }

    addApi() {
        this.apis.push({ name: '', method: 'GET', url: '', params: [], headers: [], jsonBody: '', xmlBody: '', chainParams: [] });
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
                    console.log(value);
                    if (value) {
                        if (api.jsonBody) {
                            console.log(api.jsonBody);
                            api.jsonBody = this.setValueByPath(api.jsonBody, chainParam.path, value);
                            console.log(api.jsonBody);
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
                data.responses[0].name = api.name;  // Attach the API name to the response
                results.push(data.responses[0]);
                executeApi(index + 1);
            });
        };
        executeApi(0);
    }

    // Function to get value by path in a JSON object
    getValueByPath(obj: any, path: string): any {
        try {
            const parts = path.split('.');
            console.log(parts);    // ['Materials[0]', 'Id']
            let current = obj;
            for (const part of parts) {
                console.log(part);
                const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
                console.log(current);
                if (arrayMatch) {
                    console.log('1');
                    current = current[arrayMatch[1]][parseInt(arrayMatch[2], 10)];
                } else {
                    console.log('2');
                    current = current[part];
                    console.log(part);
                }
                if (current === undefined || current === null) {
                    throw new Error(`Path "${path}" not found in object`);
                }
            }
            return current;
        } catch (e) {
            console.error(`Error getting value by path "${path}" in object:`, e);
            return null;
        }
    }

    // Function to set value by path in a JSON object
    setValueByPath(json: string, path: string, value: any): string {
        try {
            const obj = JSON.parse(json);
            const parts = path.split('.');
            console.log(parts);
            let current = obj;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                console.log(part);
                const arrayMatch = part.match(/^(.*?)(\[(\d+)\])?$/);
                console.log(arrayMatch);
                if (arrayMatch) {
                    const key = arrayMatch[1];
                    const index = arrayMatch[3] !== undefined ? parseInt(arrayMatch[3], 10) : null;
                    if (index !== null) {
                        if (!current[key] || !Array.isArray(current[key])) {
                            throw new Error(`Path "${path}" not found: "${key}" is not an array or does not exist`);
                        }
                        if (i === parts.length - 1) {
                            console.log("1");
                            current[key][index] = value;
                        } else {
                            console.log("2");
                            if (!current[key][index]) {
                                current[key][index] = {};
                            }
                            current = current[key][index];
                        }
                    } else {
                        if (i === parts.length - 1) {
                            console.log("3");
                            current[key] = value;
                        } else {
                            if (!current[key]) {
                                console.log("4");
                                current[key] = {};
                            }
                            current = current[key];
                        }
                    }
                } else {
                    throw new Error(`Invalid path "${path}"`);
                }
            }
            return JSON.stringify(obj);
        } catch (e) {
            console.error(`Error setting value by path "${path}" to "${value}" in JSON:`, e);
            return json;
        }
    }
}
