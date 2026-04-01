// this gets rid of html based error messages and makes the testing output cleaner
let warnSpy;
let errorSpy

beforeAll(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});


afterAll(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
});