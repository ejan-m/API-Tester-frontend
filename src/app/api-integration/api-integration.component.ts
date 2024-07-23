import { Component } from '@angular/core';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-api-integration',
  templateUrl: './api-integration.component.html',
  styleUrls: ['./api-integration.component.css']
})
export class ApiIntegrationComponent {
    apis = [ { method: 'GET', url: '', params: [], headers: [], jsonBody: '', xmlBody: '', chainParams: [] }];
    responses: { body: any, status_code: number, content_type: string }[] = [];

    constructor(private apiService: ApiService) { }

    addApi() {
        this.apis.push({ method: 'GET', url: '', params: [], headers: [], jsonBody: '', xmlBody: '', chainParams: [] });
    }

    removeApi(index: number) {
        this.apis.splice(index, 1);
    }

    runTests() {
        this.apiService.runTests(this.apis).subscribe((data: any) => {
            this.responses = data.responses;
        })
    }
}
