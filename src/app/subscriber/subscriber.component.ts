import { Subscriber } from "./../models/subscriber";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AngularBootstrapToastsService } from "angular-bootstrap-toasts";
import { ApiService } from "../services/api.service";
import Swal from "sweetalert2";
import { SubSink } from "subsink";

@Component({
  selector: "app-subscriber",
  templateUrl: "./subscriber.component.html",
  styleUrls: ["./subscriber.component.scss"],
})
export class SubscriberComponent implements OnInit, OnDestroy {
  public subscribeState: string = "Check Status";
  public subscriberData;
  public subscriberForm: FormGroup;
  public subs = new SubSink();

  constructor(
    public apiService: ApiService,
    private toastService: AngularBootstrapToastsService
  ) {}

  ngOnInit(): void {
    this.setupForm();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setState(state) {
    this.subscribeState = state;
  }

  getState(state) {
    return {
      "btn-danger": state == "Unsubscribe",
      "btn-outline-secondary": state == "Check Status",
      "btn-outline-info": state == "Subscribe",
    };
  }

  showCheckStatus() {
    return (
      this.subscribeState == "Subscribe" || this.subscribeState == "Unsubscribe"
    );
  }

  onSubmit(e) {
    e.preventDefault();

    if (!this.subscriberForm.valid) {
      return;
    }

    this.subscribeState == "Subscribe"
      ? this.subscribe()
      : this.subscribeState == "Unsubscribe"
      ? this.confirmAction(this.subscribeState)
      : this.checkStatus();
  }

  private checkStatus() {
    const params = {
      msisdn: this.subscriberForm.get("phone_number").value,
      carrier: "mtn",
      product_domain_name: "jobsplus.jobsdotgo.com",
    };

    this.subs.sink = this.apiService
      .post("/check/subscribe-status", params)
      .subscribe((data: Subscriber) => {
        if(data.message !== "error") {
          this.setState("Unsubscribe");
          this.subscriberForm.reset();
        }

        this.subscriberData = data;
        this.showToast(data.message);
      });
  }

  private unsubscribe() {
    const params = {
      msisdn: this.subscriberForm.get("phone_number").value,
      channel: "WIDGET",
      carrier: "mtn",
      product_domain_name: "jobsplus.jobsdotgo.com",
    };

    this.subs.sink = this.apiService
      .post("/unsubscribe", params)
      .subscribe((data: Subscriber) => {
        this.subscriberData = data;
        this.showToast(data.message);
        this.subscriberForm.reset();
      });
  }

  private subscribe() {
    const params = {
      msisdn: this.subscriberForm.get("phone_number").value,
      channel: "WIDGET",
      auto_renew: true,
      product_domain_name: "jobsplus.jobsdotgo.com",
    };

    this.subs.sink = this.apiService
      .post("/subscribe", params)
      .subscribe((data: Subscriber) => {
        this.subscriberData = data;
        this.showToast(data.message);
      });
  }

  private setupForm() {
    this.subscriberForm = new FormGroup({
      phone_number: new FormControl("", [
        Validators.maxLength(10),
        Validators.required,
      ]),
    });
  }

  private showToast(message) {
    this.toastService.showConfirmToast({
      text: message,
      title: "Subscriber Status",
      duration: 2500,
    });
  }

  private confirmAction(state) {
    Swal.fire({
      title: `Are you sure you want to ${state}`,
      text:
        "You will be able to subscribe again. Just that you will have to pay some fee!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${state}!`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.unsubscribe();
        Swal.fire(`${state}ed!`, `You have been ${state}ed.`, "success");
      }
    });
  }
}
