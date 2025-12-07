
# Component Migration Template - Zoneless + OnPush Pattern

This template shows how to convert your existing components to use zoneless change detection with OnPush strategy and signals.

## Template 1: Simple Data Display Component

### BEFORE (Traditional with Observables):
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-data-display',
  template: `
    <div *ngIf="data$ | async as data">
      <p>{{ data.title }}</p>
    </div>
  `,
  standalone: true
})
export class DataDisplayComponent implements OnInit, OnDestroy {
  data$ = this.service.getData$();
  private destroy$ = new Subject<void>();

  constructor(private service: DataService) {}

  ngOnInit() {
    // Optional: if you need to do something on init
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }
}
```

### AFTER (With OnPush + Signals):
```typescript
import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-data-display',
  template: `
    <div *ngIf="data() as data">
      <p>{{ data.title }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class DataDisplayComponent {
  data = signal<Data | null>(null);

  constructor(private service: DataService) {
    this.service.getData$()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.data.set(data));
  }
}
```

---

## Template 2: Form Component with User Input

### BEFORE:
```typescript
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" />
      <button [disabled]="!form.valid || isSubmitting">Submit</button>
      <div *ngIf="error$ | async as error">{{ error }}</div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class UserFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  error$ = new BehaviorSubject<string | null>(null);
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private service: UserService) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.email]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.service.submitForm(this.form.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.isSubmitting = false,
          error: (err) => {
            this.error$.next(err.message);
            this.isSubmitting = false;
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }
}
```

### AFTER:
```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" />
      <button [disabled]="!form.valid || isSubmitting()">Submit</button>
      <div *ngIf="error()">{{ error() }}</div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class UserFormComponent {
  form: FormGroup;
  error = signal<string | null>(null);
  isSubmitting = signal(false);

  constructor(private fb: FormBuilder, private service: UserService) {
    this.form = this.fb.group({
      email: ['', Validators.email]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.service.submitForm(this.form.value)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => this.isSubmitting.set(false),
          error: (err) => {
            this.error.set(err.message);
            this.isSubmitting.set(false);
          }
        });
    }
  }
}
```

---

## Template 3: List Component with Pagination

### BEFORE:
```typescript
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-items-list',
  template: `
    <mat-table [dataSource]="items$ | async">
      <ng-container matColumnDef="name">
        <mat-header-cell>Name</mat-header-cell>
        <mat-cell>{{ element.name }}</mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <mat-paginator (page)="onPageChange($event)"></mat-paginator>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ItemsListComponent implements OnInit, OnDestroy {
  items$!: Observable<Item[]>;
  displayedColumns = ['name'];
  private pageChange$ = new Subject<PageEvent>();
  private destroy$ = new Subject<void>();

  constructor(private service: ItemService) {}

  ngOnInit() {
    this.items$ = this.pageChange$.pipe(
      startWith(0),
      switchMap(event => this.service.getItems(event.pageIndex)),
      takeUntil(this.destroy$)
    );
  }

  onPageChange(event: PageEvent) {
    this.pageChange$.next(event);
  }

  ngOnDestroy() {
    this.pageChange$.complete();
    this.destroy$.complete();
  }
}
```

### AFTER:
```typescript
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-items-list',
  template: `
    <mat-table [dataSource]="items()">
      <ng-container matColumnDef="name">
        <mat-header-cell>Name</mat-header-cell>
        <mat-cell>{{ element.name }}</mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
    <mat-paginator 
      [pageSizeOptions]="[5, 10, 25]"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      (page)="onPageChange($event)">
    </mat-paginator>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ItemsListComponent {
  items = signal<Item[]>([]);
  pageIndex = signal(0);
  pageSize = signal(10);
  displayedColumns = ['name'];

  constructor(private service: ItemService) {
    this.loadItems();
  }

  private loadItems() {
    this.service.getItems(this.pageIndex(), this.pageSize())
      .pipe(takeUntilDestroyed())
      .subscribe(items => this.items.set(items));
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadItems();
  }
}
```

---

## Template 4: Parent-Child Communication Component

### BEFORE:
```typescript
// Parent
@Component({
  selector: 'app-parent',
  template: `
    <app-child 
      [item]="item$ | async"
      (itemSelected)="onItemSelected($event)">
    </app-child>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ParentComponent implements OnInit {
  item$ = this.service.getItem$();

  constructor(private service: ItemService) {}
}

// Child
@Component({
  selector: 'app-child',
  template: `
    <div *ngIf="item">
      <h2>{{ item.title }}</h2>
      <button (click)="select()">Select</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ChildComponent {
  @Input() item!: Item;
  @Output() itemSelected = new EventEmitter<Item>();

  select() {
    this.itemSelected.emit(this.item);
  }
}
```

### AFTER (Modern with input/output):
```typescript
// Parent
@Component({
  selector: 'app-parent',
  template: `
    <app-child 
      [item]="item()"
      (itemSelected)="onItemSelected($event)">
    </app-child>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ParentComponent {
  item = signal<Item | null>(null);

  constructor(private service: ItemService) {
    this.service.getItem$()
      .pipe(takeUntilDestroyed())
      .subscribe(item => this.item.set(item));
  }

  onItemSelected(item: Item) {
    console.log('Item selected:', item);
  }
}

// Child (Using new input/output APIs - Angular 17+)
import { input, output } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `
    <div *ngIf="item()">
      <h2>{{ item().title }}</h2>
      <button (click)="select()">Select</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ChildComponent {
  item = input<Item | null>(null);
  itemSelected = output<Item>();

  select() {
    if (this.item()) {
      this.itemSelected.emit(this.item()!);
    }
  }
}
```

---

## Template 5: Service Integration with Dependency Injection

### BEFORE:
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSubject = new BehaviorSubject<Data[]>([]);
  public data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadData() {
    this.http.get<Data[]>('/api/data')
      .subscribe(data => this.dataSubject.next(data));
  }

  addData(item: Data) {
    const current = this.dataSubject.value;
    this.dataSubject.next([...current, item]);
  }
}

@Component({
  selector: 'app-data-viewer',
  template: `<div>{{ (dataService.data$ | async) | json }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class DataViewerComponent implements OnInit {
  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadData();
  }
}
```

### AFTER:
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSignal = signal<Data[]>([]);
  public readonly data = this.dataSignal.asReadonly();
  public readonly dataCount = computed(() => this.dataSignal().length);

  private http = inject(HttpClient);

  loadData() {
    this.http.get<Data[]>('/api/data')
      .subscribe(data => this.dataSignal.set(data));
  }

  addData(item: Data) {
    this.dataSignal.update(current => [...current, item]);
  }
}

@Component({
  selector: 'app-data-viewer',
  template: `<div>{{ (dataService.data() | json) }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class DataViewerComponent {
  constructor(public dataService: DataService) {
    this.dataService.loadData();
  }
}
```

---

## Conversion Checklist

When converting each component, follow this checklist:

- [ ] Add `ChangeDetectionStrategy.OnPush` to `@Component` decorator
- [ ] Remove `implements OnInit, OnDestroy` if no longer needed
- [ ] Replace `BehaviorSubject` with `signal` for component state
- [ ] Replace `Subject` with `effect` or `computed` where appropriate
- [ ] Use `takeUntilDestroyed()` for RxJS subscriptions
- [ ] Remove manual `ngOnDestroy()` if only used for `destroy$.complete()`
- [ ] Update templates to call signal functions: `value()` instead of `value`
- [ ] Replace `@Input`/`@Output` with `input()`/`output()` (Angular 17+)
- [ ] Update async pipe usage if switching from observables to signals
- [ ] Test thoroughly, especially reactive updates

---

## Performance Tips

1. **Use `computed()` for derived state** - Automatic memoization
2. **Batch signal updates** - Use `untracked()` when needed
3. **Prefer signals over subjects** - Better memory efficiency
4. **Use `effect()` for side effects** - Automatic cleanup
5. **Keep templates simple** - Push logic to component or service
6. **Use virtual scrolling for large lists** - Works great with OnPush
7. **Lazy load routes** - Reduces initial bundle size further

---

## Common Gotchas

❌ **Signal mutation not detected:**
```typescript
this.data().items.push(newItem); // WRONG - mutation
```

✅ **Proper signal update:**
```typescript
this.data.update(d => ({
  ...d,
  items: [...d.items, newItem]
}));
```

❌ **Forgetting to call signal:**
```typescript
{{ data }}  <!-- WRONG - returns signal function -->
```

✅ **Correct signal usage in templates:**
```typescript
{{ data() }}  <!-- CORRECT - calls signal -->
```

---

## Resources

- [Angular Signals](https://angular.dev/guide/signals)
- [Change Detection](https://angular.dev/guide/change-detection)
- [Angular 17 Docs](https://angular.dev)
