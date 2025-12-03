import { TestBed } from '@angular/core/testing';
import { ResponseStorageService } from './response-storage.service';
import { SubmissionRecord } from '../models/submission.model';

describe('ResponseStorageService', () => {
    let service: ResponseStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
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

            service.createSubmission(formId, data).subscribe((submission) => {
                expect(submission).toBeDefined();
                expect(submission.id).toBeDefined();
                expect(submission.formId).toBe(formId);
                expect(submission.data).toEqual(data);
                expect(submission.status).toBe('new');
                expect(submission.submittedAt).toBeDefined();
                done();
            });
        });

        it('should store submission in local storage', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe(() => {
                service.getSubmissions().subscribe((result) => {
                    expect(result.submissions.length).toBeGreaterThan(0);
                    done();
                });
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
                        expect(result.submissions.length).toBe(2);
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
                        expect(result.submissions.length).toBe(1);
                        expect(result.submissions[0].status).toBe('reviewed');
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
                service.getSubmissions({ page: 1, pageSize: 10 }).subscribe((result) => {
                    expect(result.submissions.length).toBe(10);
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

            service.createSubmission(formId, data).subscribe((submission) => {
                service.updateSubmission(submission.id, { status: 'reviewed' }).subscribe((updated) => {
                    expect(updated.status).toBe('reviewed');
                    done();
                });
            });
        });

        it('should update submission notes', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe((submission) => {
                service.updateSubmission(submission.id, { notes: 'Test note' }).subscribe((updated) => {
                    expect(updated.notes).toBe('Test note');
                    done();
                });
            });
        });
    });

    describe('deleteSubmission', () => {
        it('should delete a submission', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe((submission) => {
                service.deleteSubmission(submission.id).subscribe(() => {
                    service.getSubmissions().subscribe((result) => {
                        expect(result.submissions.length).toBe(0);
                        done();
                    });
                });
            });
        });
    });

    describe('exportAsJson', () => {
        it('should export submissions as JSON', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John' };

            service.createSubmission(formId, data).subscribe((submission) => {
                const json = service.exportAsJson([submission]);
                expect(json).toContain('"name":"John"');
                done();
            });
        });
    });

    describe('exportAsCsv', () => {
        it('should export submissions as CSV', (done) => {
            const formId = 'test-form-1';
            const data = { name: 'John', email: 'john@example.com' };

            service.createSubmission(formId, data).subscribe((submission) => {
                const csv = service.exportAsCsv([submission], Object.keys(data));
                expect(csv).toContain('name,email');
                expect(csv).toContain('John');
                done();
            });
        });
    });

    describe('getMetadata', () => {
        it('should calculate correct metadata', (done) => {
            const formId = 'test-form-1';
            const promises = [];

            for (let i = 0; i < 5; i++) {
                promises.push(new Promise((resolve) => {
                    service.createSubmission(formId, { index: i }).subscribe(resolve);
                }));
            }

            Promise.all(promises).then(() => {
                service.getMetadata().subscribe((metadata) => {
                    expect(metadata.totalSubmissions).toBe(5);
                    expect(metadata.newSubmissions).toBe(5);
                    done();
                });
            });
        });
    });
});
