// const nombreRouta = require('../routes/User.routes');
// const request = require('supertest');

// describe("Get /nombreRoita", () => {
//     test("Mensage", async () => {
//         const res = await request(nombreRouta).get('/routa').send();
//         expect(res.status).toBe(200);
//     })
// })

// describe("POST /nombreRoita", () => {
//     test("Mensage", async () => {
//         const res = await request(nombreRouta).get('/routa').send();
//         expect(res.status).toBe(200);
//     });

//     test("Mensage a content-type", async () => {
//         const res = await request(nombreRouta).post('/routa').send();
//         expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"))
//     });

//     //Response with an Id
//     test("Mensage a content-type", async () => {
//         const res = await request(nombreRouta).post('/routa').send({
//             title: "ejempl",
//             description: 'Ejemplo'
//         });
//         expect(res.body.id).toBeDefined();
//     });


// })

// // package.json => field test: "set NODE_OPTIONS=--experimental-vm-modules && jest"