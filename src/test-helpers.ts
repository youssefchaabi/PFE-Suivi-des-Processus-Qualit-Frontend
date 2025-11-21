import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

export const mockMatSnackBar = {
  open: jasmine.createSpy('open').and.returnValue({
    afterDismissed: () => of(true)
  })
};

export const mockMatDialog = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true)
  })
};

export const mockActivatedRoute = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    params: {},
    queryParams: {}
  }
};

export const testProviders = [
  { provide: MatSnackBar, useValue: mockMatSnackBar },
  { provide: MatDialog, useValue: mockMatDialog },
  { provide: ActivatedRoute, useValue: mockActivatedRoute }
];
