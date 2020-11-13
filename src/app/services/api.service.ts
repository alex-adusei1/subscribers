import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpEventType } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  protected BASE_URL = 'http://pro.jobsdotgo.com/api/v1';
  public _url: string;
  public httpOptions;
  public requesting = false;
  api_params = {

  }

  constructor(protected http: HttpClient) {
    this._url = '/';
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  public get(url: string, params: object = null): Observable<Object> {
    let full_url = this.BASE_URL + url;
    this.httpOptions['params'] = params;
    this.requesting = true;

    return this.http.get(full_url, this.httpOptions).pipe(map(res => {
      this.requesting = false;
      return res;
    }));
  }

  public post(url: string, params: object, qparams: object = null): Observable<Object> {
    var full_url = this.BASE_URL + url;
    this.httpOptions['params'] = qparams;
    this.requesting = true;

    return this.http.post(full_url, params, this.httpOptions).pipe(map(res => {
      this.requesting = false;
      return res;
    }), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    this.requesting = false;
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError (
      'Something bad happened; please try again later.');
  }
}
