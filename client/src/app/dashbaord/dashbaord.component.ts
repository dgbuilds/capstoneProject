import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import {
  faCalendar,
  faEllipsisV,
  faClipboard,
  faPlus,
  faShare,
  faCalendarPlus,
  faEdit,
  faSignOutAlt,
  faCheck,
  faTimes,
  faUser,
  faBuilding,
  faTicketAlt,
  faLocationDot,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {
  // Icons
  faCalendar = faCalendar;
  faEllipsisV = faEllipsisV;
  faClipboard = faClipboard;
  faPlus = faPlus;
  faShare = faShare;
  faCalendarPlus = faCalendarPlus;
  faEdit = faEdit;
  faSignOutAlt = faSignOutAlt;
  faCheck = faCheck;
  faTimes = faTimes;
  faUser = faUser;
  faBuilding = faBuilding;
  faTicketAlt = faTicketAlt;
  faLocationDot = faLocationDot;
  faUsers = faUsers;

  // Component properties
  role: string | null = '';
  isDropdownOpen = false;
  viewingRequests = false;
  viewingEvents = false;
  showRequestForm = false;
  requestForm: FormGroup;
  requestErrorMessage = '';
  ticketMessage = '';
  ticketStatus: boolean = false;
  myEvents: Boolean = false;
  requestStatusMessage: any = '';
  requestStatus: any = true;
  selectedTicketsMap: Map<number, number> = new Map();

  // Data arrays
  requests: any[] = [];
  events: any[] = [];
  resources: any[] = [];
  clients: any[] = [];
  bookingEvents: any[] = [];
  bookingDetails: any[] = [];
  selectedTickets: any = 0;
  clientId: any;
  requestedEvents: any[] = [];

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.requestForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      preferredLocation: ['', Validators.required],
      preferredDate: ['', Validators.required],
      expectedPeople: ['', [Validators.required, Validators.min(1)]],
      status: [{ value: "Pending", disabled: true }, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.clientId = this.authService.getUserID();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    switch (this.role) {
      case 'PLANNER':
        this.loadPlannerData();
        break;
      case 'CLIENT':
        this.loadClientData();
        break;
      case 'STAFF':
        this.loadStaffData();
        break;
    }
  }

  //=======================Planner Dashboard================================//
  loadPlannerData(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res) => this.events = res,
      error: (error) => console.error('Error loading events:', error)
    });

    this.httpService.GetAllResources().subscribe({
      next: (res) => this.resources = res,
      error: (error) => console.error('Error loading resources:', error)
    });

    this.httpService.getClients().subscribe({
      next: (res) => this.clients = res,
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadRequests(): void {
    this.httpService.getRequests("pending").subscribe({
      next: (res: any[]) => this.requests = res,
      error: (error: any) => console.error('Error loading requests:', error)
    });
  }


  

  //=======================================================================




  //========================Client DashBoard===============================//
  loadClientData(): void {
    this.httpService.getClientBookedEvents(this.clientId).subscribe({
      next: (res) => this.bookingDetails = res,
      error: (error) => console.error('Error loading booking details:', error)
    })
    this.httpService.getEventByStatus("public").subscribe({
      next: (res) => this.events = res,
      error: (error) => console.error('Error loading events:', error)
    });
  }


  onSubmitRequest() {
    if (this.requestForm.valid) {
      this.requestForm.get('status')?.enable();
      this.httpService.createClientRequest(this.clientId, this.requestForm.value).subscribe({
        next: (response: any) => {
          this.showRequestForm = false;
          this.requestForm.reset();
          this.loadClientData();
        },
        error: (error: any) => console.error('Error submitting request:', error)
      });
    }
  }

  toggleEvents() {
    this.myEvents = !this.myEvents;
    this.httpService.getClientRequests(this.clientId).subscribe((res) => this.requestedEvents = res)
  }



  //===========================Staff===========================//  
  loadStaffData(): void {
    this.httpService.GetAllevents().subscribe({
      next: (res) => this.bookingDetails = res,
      error: (error) => console.error('Error loading staff events:', error)
    })
  }


  viewEvents(): void {
    this.router.navigate(['/view-events']);
  }

  //==========================================================//



  // Planner request
  handleRequest(request: any, action: any): void {
    if (action == 'approve') {
      this.requestStatusMessage = 'Approved';
      this.requestStatus = true;
      console.log(this.requestStatusMessage);
      this.httpService.createEvent({
        type: "private",
        title: request.name,
        description: request.description,
        dateTime: request.preferredDate,
        location: request.preferredLocation,
        status: request.status,
        tickets: 0
      }).subscribe();
    }
    if (action == 'reject') {
      this.requestStatusMessage = 'Sorry! Currently we have no resources available for the event.';
      this.requestStatus = false;
    }
    this.httpService.handleRequest(request.requestId, action).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (error: any) => console.error(`Error ${action}ing request:`, error)
    });
  }

  toggleViewRequests(): void {
    this.viewingRequests = !this.viewingRequests;
    if (this.viewingRequests) {
      this.loadRequests();
    } else {
      this.ngOnInit();
    }
  }




  // Booking of tickets
  incrementTickets(eventId: number) {
    const currentCount = this.selectedTicketsMap.get(eventId) || 0;
    this.selectedTicketsMap.set(eventId, currentCount + 1);
  }

  decrementTickets(eventId: number) {
    const currentCount = this.selectedTicketsMap.get(eventId) || 0;
    if (currentCount > 0) {
      this.selectedTicketsMap.set(eventId, currentCount - 1);
    }
  }

  bookTickets(event: any) {
    const ticketCount = this.selectedTicketsMap.get(event.eventID) || 0;
    this.httpService.checkTicketAvailability(event.eventID, ticketCount).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.available) {
          this.httpService.bookEventTickets(this.clientId, event.eventID, ticketCount).subscribe({
            next: () => {
              event.ticketMessage = `Successfully booked ${ticketCount} tickets!`;
              event.ticketStatus = true;
              this.selectedTicketsMap.set(event.eventID, 0);
              this.loadClientData();
            },
            error: () => {
              this.ticketMessage = 'Error booking tickets. Please try again.';
              this.ticketStatus = false;
            }
          });
        } else {
          this.ticketMessage = `Only ${response.availableTickets} tickets available`;
          this.ticketStatus = false;
        }
      },
      error: (error) => {
        this.ticketMessage = 'Error checking ticket availability';
        this.ticketStatus = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  toggleRequest() {
    this.showRequestForm = !this.showRequestForm;
    if (!this.showRequestForm) {
      this.ngOnInit();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }


  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }



  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.isDropdownOpen = false;
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }



}
