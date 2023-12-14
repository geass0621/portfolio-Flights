import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FlightService } from './../api/services/flight.service';
import { BookDto, FlightRm } from '../api/models';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-book-flight',
  templateUrl: './book-flight.component.html',
  styleUrls: ['./book-flight.component.css']
})
export class BookFlightComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private flightService: FlightService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,) {

  }

  flightId: string = "not loaded"
  flight: FlightRm = {}

  form = this.fb.group({
    number: [1, Validators.compose([Validators.required, Validators.min(1), Validators.max(254)])]
  })

  ngOnInit(): void {
    
    this.route.paramMap.subscribe(p => this.findFlight(p.get("flightId")))
  }

  private findFlight = (flightId: string | null) => {
    this.flightId = flightId ?? 'not passed';

    this.flightService.findFlight({ id: this.flightId })
      .subscribe(flight => this.flight = flight, this.handleError)
  }

  private handleError = (err: any) => {

    if (err.status == 404) {
      alert("Flight not found")
      this.router.navigate(['/search-flight'])
    }

    if (err.status == 409) {
      console.log("err: " + err)
      alert(JSON.parse(err.error).message)
    }
    console.log("Response Error. Status: ", err.status)
    console.log("Response Error. Status text: ", err.statusText)
    console.log(err)
  }

  book() {

    if (this.form.invalid) {
      return;
    }



    console.log(`Booking ${this.form.get('number')?.value} passengers for the flight: ${this.flight.id}`)

    const booking: BookDto = {
      flightId: this.flightId,
      passengerEmail: this.authService.currentUser?.email,
      numberOfSeats: this.form.get('number')?.value!
    }

    this.flightService.bookFlight({body: booking}).subscribe(_ => this.router.navigate(['/my-booking']), this.handleError)
  }

  get number() {
    return this.form.controls.number
  }
}