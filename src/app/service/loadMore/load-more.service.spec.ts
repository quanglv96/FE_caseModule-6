import { TestBed } from '@angular/core/testing';

import { LoadMoreService } from './load-more.service';

describe('LoadMoreService', () => {
  let service: LoadMoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadMoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
