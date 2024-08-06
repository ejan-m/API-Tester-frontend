import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Scenario {
    name: string;
    steps: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    scenarios: Scenario[] = [
        { name: 'A -> B -> C', steps: 'A -> B -> C' },
        { name: 'A -> B -> E', steps: 'A -> B -> E' },
        { name: 'A -> C -> G -> H', steps: 'A -> C -> G -> H' }
    ];

    constructor(private router: Router) { }

    ngOnInit(): void {
    }

    runScenario(index: number) {
        // Logic to run the scenario
        console.log(`Running scenario ${index + 1}`);
    }

    deleteScenario(index: number) {
        this.scenarios.splice(index, 1);
    }
}
