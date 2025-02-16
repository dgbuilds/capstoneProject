import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import {
  faCalendar,
  faSignOutAlt,
  faSearch,
  faExclamationCircle,
  faInfoCircle,
  faBoxes
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit {
  // Icons
  faCalendar = faCalendar;
  faSignOutAlt = faSignOutAlt;
  faSearch = faSearch;
  faExclamationCircle = faExclamationCircle;
  faInfoCircle = faInfoCircle;
  faBoxes = faBoxes;

  eventId: string = '';
  events: any[] = [];
  filteredEvents: any[] = [];
  errorMessage: string = '';

  constructor(
    private http: HttpService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadAllEvents();
  }

  loadAllEvents(): void {
    this.http.GetAllevents().subscribe({
      next: (data: any) => {
        this.events = data;
        this.filteredEvents = [...this.events];
      },
      error: (error) => {
        this.errorMessage = 'Failed to load events. Please try again.';
      }
    });
  }

  loadEvents(): void {
    if (this.eventId) {
      this.filteredEvents = this.events.filter(e =>
        e.eventID.toString().includes(this.eventId)
      );
    } else {
      this.filteredEvents = [...this.events];
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
