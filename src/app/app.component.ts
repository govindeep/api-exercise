import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  baseApiUrl = 'https://api.github.com';
  submitted = false;
  searchForm = new FormGroup({
    searchInput: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  searchResults$ = new BehaviorSubject<any>(undefined);
  repoIssues$ = new BehaviorSubject<any>(undefined);

  constructor(private _http: HttpClient) {}

  get searchInput() {
    return this.searchForm.get('searchInput');
  }

  getRepos = () => {
    this._http
      .get(`${this.baseApiUrl}/orgs/${this.searchForm.value.searchInput}/repos`)
      .pipe(
        first(),
        catchError((err) => {
          this.searchForm.controls.searchInput.setErrors({ invalid: true });
          return of(undefined);
        }),
        map((res: any) => {
          if (res?.length > 0) {
            this.searchResults$.next(res);
            return res;
          }
          this.searchResults$.next(undefined);
          return undefined;
        })
      )
      .subscribe();
  };

  showRepoDetails = (repo: { issues_url: string; name: string }) => {
    // this.repoIssues$.next(repo);
    this._http
      .get(`${repo.issues_url.substring(0, repo.issues_url.indexOf('{'))}`)
      .pipe(
        first(),
        catchError((err) => of(undefined)),
        map((res: any) => {
          this.repoIssues$.next({ name: repo.name, issues: res });
          return res;
        })
      )
      .subscribe();
  };
}
