import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import {
  faCalendar,
  faSignOutAlt,
  faDashboard,
  faSearch,
  faEdit,
  faSave,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-view-events',
  templateUrl: './view-events.component.html',
  styleUrls: ['./view-events.component.scss']
})
export class ViewEventsComponent implements OnInit {
  // Icons
  faCalendar = faCalendar;
  faSignOutAlt = faSignOutAlt;
  faDashboard = faDashboard;
  faSearch = faSearch;
  faEdit = faEdit;
  faSave = faSave;
  faCheckCircle = faCheckCircle;

  events: any[] = [];
  filteredEvents: any[] = [];
  searchId: string = '';
  itemForm!: FormGroup;
  selectedEvent: any = null;
  successMessage: string = '';
  isCompleted : boolean = false;
  errorMessage: string = '';

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAllEvents();
  }

  private initializeForm(): void {
    this.itemForm = this.fb.group({
      title: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: true }, Validators.required],
      dateTime: [{ value: '', disabled: true }, Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      status: ['', Validators.required]
    });
  }

  loadAllEvents(): void {
    this.httpService.GetAllevents().subscribe({
      next: (data: any) => {
        this.events = data;
        this.filteredEvents = [...this.events];
      },
      error: () => {
        this.errorMessage = "Failed to load event"
      }
    });
  }

  loadEvents(): void {
    if (this.searchId) {
      this.filteredEvents = this.events.filter((e) => {
        return e.eventID.toString().includes(this.searchId);
      });
    } else {
      this.filteredEvents = [...this.events];
    }
  }

  selectEvent(event: any): void {
    this.selectedEvent = { ...event };
    this.itemForm.patchValue(event);
  }

  updateEvent(): void {
    if (!this.selectedEvent || !this.itemForm.valid) return;
    this.itemForm.get('title')?.enable();
    this.itemForm.get('description')?.enable();
    this.itemForm.get('dateTime')?.enable();
    this.itemForm.get('location')?.enable();
    this.httpService.updateEvent(this.selectedEvent.eventID, this.itemForm.value).subscribe({
      next: () => {
        this.successMessage = "Event updated successfully";
        this.selectedEvent = null;
        this.loadAllEvents();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        // Handle error
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToDashboard() : void {
    this.router.navigate(['/dashboard']);
  }
}
