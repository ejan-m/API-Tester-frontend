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
    key: string;
    sourceKey: string;
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
                        value = this.searchKeyInJson(previousApiResponse.body, chainParam.sourceKey);
                    } else {
                        value = this.searchKeyInXml(previousApiResponse.body, chainParam.sourceKey);
                    }
                    if (value) {
                        if (api.jsonBody) {
                            api.jsonBody = this.replaceValueInJson(api.jsonBody, chainParam.key, value);
                        } else if (api.xmlBody) {
                            api.xmlBody = this.replaceValueInXml(api.xmlBody, chainParam.key, value);
                        }
                    }
                });
            }
            const formattedApi: any = {
                ...api,
                body: api.method === 'POST' || api.method === 'PUT' ? (api.jsonBody || api.xmlBody) : ''
            };
            this.apiService.runTests([formattedApi]).subscribe((data: { responses: ApiResponse[] }) => {
                results.push(data.responses[0]);
                executeApi(index + 1);
            });
        };

        executeApi(0);
    }
    // Function to search for a key in a JSON object
    searchKeyInJson(obj: any, key: string): any {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.hasOwnProperty(key)) return obj[key];
        for (const k in obj) {
            if (obj.hasOwnProperty(k) && typeof obj[k] === 'object') {
                const result: any = this.searchKeyInJson(obj[k], key);
                if (result) return result;
            }
        }
        return null;
    }
    // Function to search for a key in an XML string
    searchKeyInXml(xml: string, key: string): any {
        const regex = new RegExp(`<${key}>(.*?)</${key}>`, 'g');
        const match = regex.exec(xml);
        return match ? match[1] : null;
    }
    // Function to replace a value in a JSON string
    replaceValueInJson(json: string, key: string, value: any): string {
        try {
            const obj = JSON.parse(json);
            this.replaceValueInJsonObject(obj, key, value);
            return JSON.stringify(obj);
        } catch (e) {
            return json;
        }
    }
    // Recursive function to replace a value in a JSON object
    replaceValueInJsonObject(obj: any, key: string, value: any): void {
        if (!obj || typeof obj !== 'object') return;
        if (obj.hasOwnProperty(key)) {
            obj[key] = value;
            return;
        }
        for (const k in obj) {
            if (obj.hasOwnProperty(k) && typeof obj[k] === 'object') {
                this.replaceValueInJsonObject(obj[k], key, value);
            }
        }
    }
    // Function to replace a value in an XML string
    replaceValueInXml(xml: string, key: string, value: any): string {
        const regex = new RegExp(`(<${key}>)(.*?)(</${key}>)`, 'g');
        return xml.replace(regex, `$1${value}$3`);
    }
}
