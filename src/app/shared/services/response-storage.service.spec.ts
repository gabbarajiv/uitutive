import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ResponseStorageService } from './response-storage.service';
import { SubmissionRecord } from '../models/submission.model';

describe('ResponseStorageService', () => {
    let service: ResponseStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ResponseStorageService]
        });
        service = TestBed.inject(ResponseStorageService);
        // Clear local storage before each test
        localStorage.clear();
    });

    afterEach(() => {
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
                },
                error: (err) => fail('Should not error: ' + err)
            });
        });
    });

    describe('getSubmissions', () => {
        it('should return all submissions', (done) => {
            const formId = 'test-form-1';
            const data1 = { name: 'John' };
            const data2 = { name: 'Jane' };

            service.createSubmission(formId, data1).subscribe(() => {
                service.createSubmission(formId, data2).subscribe(() => {
                    service.getSubmissions().subscribe((result) => {
                        expect(result.items.length).toBe(2);
                        done();
                    });
                });
            });
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
                });
            });
        });

        it('should paginate submissions', (done) => {
            const formId = 'test-form-1';
            const promises = [];

            for (let i = 0; i < 15; i++) {
                promises.push(new Promise((resolve) => {
                    service.createSubmission(formId, { index: i }).subscribe(resolve);
                }));
            }

            Promise.all(promises).then(() => {
                service.getSubmissions(undefined, undefined, 1, 10).subscribe((result) => {
                    expect(result.items.length).toBe(10);
                    expect(result.total).toBe(15);
                    done();
                });
            });
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
                },
                error: (err) => fail('Should not error: ' + err)
            });
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
                },
                error: (err) => fail('Should not error: ' + err)
            });
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
                        },
                        error: (err) => fail('Should not error: ' + err)
                    });
                },
                error: (err) => fail('Should not error: ' + err)
            });
        });
    });

    describe('exportAsJson', () => {
        it('should export submissions as JSON', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe({
                next: (submission) => {
                    const json = service.exportAsJson([submission]);
                    expect(json).toContain('"name":"John"');
                    done();
                },
                error: (err) => fail('Should not error: ' + err)
            });
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
        });
    });

    describe('getMetadata', () => {
        it('should calculate correct metadata', (done) => {
            const formId = 'test-form-1';
            const promises = [];

            for (let i = 0; i < 5; i++) {
                promises.push(new Promise((resolve) => {
                    service.createSubmission(formId, { index: i }).subscribe({
                        next: resolve,
                        error: (err) => fail('Should not error: ' + err)
                    });
                }));
            }

            Promise.all(promises).then(() => {
                service.getMetadata().subscribe({
                    next: (metadata) => {
                        expect(metadata.totalCount).toBe(5);
                        expect(metadata.newCount).toBe(5);
                        done();
                    },
                    error: (err) => fail('Should not error: ' + err)
                });
            });
        });
    });
});