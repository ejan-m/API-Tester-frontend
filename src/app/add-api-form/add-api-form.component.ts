import { Component, Input, Output, EventEmitter } from '@angular/core';

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
    headers: ApiHeader[];
    jsonBody: string;
    xmlBody: string;
    chainParams: ChainParam[];
}

@Component({
  selector: 'app-add-api-form',
  templateUrl: './add-api-form.component.html',
  styleUrls: ['./add-api-form.component.css']
})
export class AddApiFormComponent {
    @Input() api: Api = { method: 'GET', url: '', headers: [], jsonBody: '', xmlBody: '', chainParams: [] };
    @Input() index: number = 0;
    @Output() remove = new EventEmitter<number>();

    methods = ['GET', 'POST', 'PUT', 'DELETE'];


    addHeader() {
        this.api.headers.push({ key: '', value: ''})
    }

    removeHeader(index: number) {
        this.api.headers.splice(index, 1);
    }

    addChainParam() {
        this.api.chainParams.push({ path: '', sourcePath: '' });
      }
      
    removeChainParam(index: number) {
        this.api.chainParams.splice(index, 1);
    }

    sendRequest() {
        // Function to send request
    }

    removeApi() {
        this.remove.emit(this.index);
    }
}
