import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResponseStorageService } from './response-storage.service';
import { SubmissionRecord } from '../models/submission.model';

describe('ResponseStorageService', () => {
    let service: ResponseStorageService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        // Clear local storage before configuring TestBed
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ResponseStorageService]
        });
        service = TestBed.inject(ResponseStorageService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // Verify no outstanding HTTP requests and clear storage
        httpMock.verify();
        localStorage.clear();
    });

    describe('createSubmission', () => {
        it('should create a new submission with unique ID', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John', email: 'john@example.com' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    expect(submission).toBeDefined();
                    expect(submission.id).toBeDefined();
                    expect(submission.formId).toBe(formId);
                    expect(submission.data).toEqual(data);
                    expect(submission.status).toBe('new');
                    expect(submission.submittedAt).toBeDefined();
                    done();
                },
                error: (err) => {
                    fail('Should not error: ' + err);
                }
            });

            // Flush HTTP request with error to trigger local storage fallback
            const req = httpMock.expectOne('/api/submissions');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });

        it('should store submission in local storage', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe({
                next: () => {
                    service.getSubmissions().subscribe({
                        next: (result) => {
                            expect(result.items.length).toBeGreaterThan(0);
                            done();
                        },
                        error: (err) => fail('Should not error: ' + err)
                    });

                    // Flush the getSubmissions request
                    const getReq = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'GET');
                    getReq.flush('Error', { status: 500, statusText: 'Server Error' });
                },
                error: (err) => fail('Should not error: ' + err)
            });

            // Flush the createSubmission request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });

    describe('getSubmissions', () => {
        it('should return all submissions', (done) => {
            const formId = 'test-form-1';
            const data1 = { name: 'John' };
            const data2 = { name: 'Jane' };

            // Create first submission
            service.createSubmission(formId, data1).subscribe(() => {
                // Create second submission
                service.createSubmission(formId, data2).subscribe(() => {
                    // Get all submissions
                    service.getSubmissions().subscribe((result) => {
                        expect(result.items.length).toBe(2);
                        done();
                    });

                    // Flush get request
                    const getReq = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'GET');
                    getReq.flush('Error', { status: 500, statusText: 'Server Error' });
                });

                // Flush second create request
                const req2 = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
                req2.flush('Error', { status: 500, statusText: 'Server Error' });
            });

            // Flush first create request
            const req1 = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req1.flush('Error', { status: 500, statusText: 'Server Error' });
        });

        it('should filter submissions by status', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe((submission) => {
                service.updateStatus(submission.id, 'reviewed').subscribe(() => {
                    service.getSubmissions({ status: 'reviewed' }).subscribe((result) => {
                        expect(result.items.length).toBe(1);
                        expect(result.items[0].status).toBe('reviewed');
                        done();
                    });

                    // Flush get request
                    const getReq = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'GET');
                    getReq.flush('Error', { status: 500, statusText: 'Server Error' });
                });

                // Flush update request after calling updateStatus
                const patchReq = httpMock.expectOne(req => req.url.includes('/api/submissions/') && req.method === 'PATCH');
                patchReq.flush('Error', { status: 500, statusText: 'Server Error' });
            });

            // Flush create request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });

        it('should paginate submissions', (done) => {
            const formId = 'test-form-1';
            const totalSubmissions = 15;
            let completedCount = 0;

            // Create all subscriptions
            for (let i = 0; i < totalSubmissions; i++) {
                service.createSubmission(formId, { index: i }).subscribe(() => {
                    completedCount++;
                    if (completedCount === totalSubmissions) {
                        // All created, now test pagination
                        service.getSubmissions(undefined, undefined, 1, 10).subscribe((result) => {
                            expect(result.items.length).toBe(10);
                            expect(result.total).toBe(15);
                            done();
                        });

                        const getReq = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'GET');
                        getReq.flush('Error', { status: 500, statusText: 'Server Error' });
                    }
                });
            }

            // Flush all POST requests
            const requests = httpMock.match(req => req.url === '/api/submissions' && req.method === 'POST');
            requests.forEach(req => req.flush('Error', { status: 500, statusText: 'Server Error' }));
        });
    });

    describe('updateSubmission', () => {
        it('should update submission status', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    service.updateSubmission(submission.id, { status: 'reviewed' }).subscribe({
                        next: (updated) => {
                            expect(updated.status).toBe('reviewed');
                            done();
                        },
                        error: (err) => fail('Should not error: ' + err)
                    });

                    // Flush patch request after calling updateSubmission
                    const patchReq = httpMock.expectOne(req => req.url.includes('/api/submissions/') && req.method === 'PATCH');
                    patchReq.flush('Error', { status: 500, statusText: 'Server Error' });
                },
                error: (err) => fail('Should not error: ' + err)
            });

            // Flush create request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });

        it('should update submission notes', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    service.updateSubmission(submission.id, { notes: 'Test note' }).subscribe({
                        next: (updated) => {
                            expect(updated.notes).toBe('Test note');
                            done();
                        },
                        error: (err) => fail('Should not error: ' + err)
                    });

                    // Flush patch request after calling updateSubmission
                    const patchReq = httpMock.expectOne(req => req.url.includes('/api/submissions/') && req.method === 'PATCH');
                    patchReq.flush('Error', { status: 500, statusText: 'Server Error' });
                },
                error: (err) => fail('Should not error: ' + err)
            });

            // Flush create request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });

    describe('deleteSubmission', () => {
        it('should delete a submission', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    service.deleteSubmission(submission.id).subscribe({
                        next: () => {
                            service.getSubmissions().subscribe({
                                next: (result) => {
                                    expect(result.items.length).toBe(0);
                                    done();
                                },
                                error: (err) => fail('Should not error: ' + err)
                            });

                            // Flush get request
                            const getReq = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'GET');
                            getReq.flush('Error', { status: 500, statusText: 'Server Error' });
                        },
                        error: (err) => fail('Should not error: ' + err)
                    });

                    // Flush delete request after calling deleteSubmission
                    const deleteReq = httpMock.expectOne(req => req.url.includes('/api/submissions/') && req.method === 'DELETE');
                    deleteReq.flush('Error', { status: 500, statusText: 'Server Error' });
                },
                error: (err) => fail('Should not error: ' + err)
            });

            // Flush create request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });

    describe('exportAsJson', () => {
        it('should export submissions as JSON', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    const json = service.exportAsJson([submission]);
                    expect(json).toContain('"name": "John"');
                    done();
                },
                error: (err) => fail('Should not error: ' + err)
            });

            // Flush create request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });

    describe('exportAsCsv', () => {
        it('should export submissions as CSV', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John', email: 'john@example.com' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    const csv = service.exportAsCsv([submission], Object.keys(data));
                    expect(csv).toContain('name,email');
                    expect(csv).toContain('John');
                    done();
                },
                error: (err) => fail('Should not error: ' + err)
            });

            // Flush create request
            const req = httpMock.expectOne(req => req.url === '/api/submissions' && req.method === 'POST');
            req.flush('Error', { status: 500, statusText: 'Server Error' });
        });
    });

    describe('getMetadata', () => {
        it('should calculate correct metadata', (done) => {
            const formId = 'test-form-1';
            const totalSubmissions = 5;
            let completedCount = 0;

            // Create all subscriptions first
            for (let i = 0; i < totalSubmissions; i++) {
                service.createSubmission(formId, { index: i }).subscribe({
                    next: () => {
                        completedCount++;
                        if (completedCount === totalSubmissions) {
                            // All created, now test metadata
                            service.getMetadata().subscribe({
                                next: (metadata) => {
                                    expect(metadata.totalCount).toBe(5);
                                    expect(metadata.newCount).toBe(5);
                                    done();
                                },
                                error: (err) => fail('Should not error: ' + err)
                            });
                        }
                    },
                    error: (err) => fail('Should not error: ' + err)
                });
            }

            // Flush all POST requests (they trigger catchError to use local storage)
            const requests = httpMock.match(req => req.url === '/api/submissions' && req.method === 'POST');
            requests.forEach(req => req.flush('Error', { status: 500, statusText: 'Server Error' }));
        });
    });
});