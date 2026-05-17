import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { StateService } from './services/state.service';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isConnected = false;

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.stateService.jiraConfig$.subscribe(config => {
      this.isConnected = !!config;
    });
  }
}

// Made with Bob